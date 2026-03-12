import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListEntries,
  useUpsertEntry,
  useDeleteEntry,
  getListEntriesQueryKey,
} from "@workspace/api-client-react";

export type JournalMode = 'vigilant' | 'restored';

export interface JournalEntry {
  id: number;
  date: string;
  mode: JournalMode;
  phase: string;
  data: Record<string, any>;
}

const LS_KEY = 'dream-entries';

function getLocalEntries(): JournalEntry[] {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function setLocalEntries(entries: JournalEntry[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch { /* ignore */ }
}

function apiToLocal(e: any): JournalEntry {
  return {
    id: parseInt(e.clientId, 10) || Number(e.clientId) || 0,
    date: e.entryDate,
    mode: e.mode as JournalMode,
    phase: e.phase,
    data: (e.data as Record<string, any>) ?? {},
  };
}

function localToApi(e: JournalEntry) {
  return {
    clientId: String(e.id),
    mode: e.mode,
    phase: e.phase,
    entryDate: e.date,
    data: e.data,
  } as const;
}

export function useJournalEntries() {
  const queryClient = useQueryClient();
  const { data: apiData, isLoading } = useListEntries({ query: { retry: 1, staleTime: 5_000 } });
  const upsertMutation = useUpsertEntry();
  const deleteMutation = useDeleteEntry();

  const apiEntries: JournalEntry[] | null = apiData?.entries?.map(apiToLocal) ?? null;
  const entries: JournalEntry[] = apiEntries ?? getLocalEntries();

  if (apiEntries) {
    setLocalEntries(apiEntries);
  }

  const addOrUpdateEntry = useCallback((entry: JournalEntry) => {
    const current = (queryClient.getQueryData<any>(getListEntriesQueryKey())?.entries?.map(apiToLocal) as JournalEntry[]) ?? getLocalEntries();
    const idx = current.findIndex(e => e.id === entry.id);
    const updated = idx >= 0
      ? current.map(e => e.id === entry.id ? entry : e)
      : [...current, entry];

    setLocalEntries(updated);

    const now = new Date().toISOString();
    queryClient.setQueryData(getListEntriesQueryKey(), {
      entries: updated.map(e => ({ ...localToApi(e), createdAt: now, updatedAt: now })),
    });

    upsertMutation.mutate({ data: localToApi(entry) });
  }, [queryClient, upsertMutation]);

  const deleteEntry = useCallback((id: number) => {
    const current = (queryClient.getQueryData<any>(getListEntriesQueryKey())?.entries?.map(apiToLocal) as JournalEntry[]) ?? getLocalEntries();
    const updated = current.filter(e => e.id !== id);

    setLocalEntries(updated);

    const now = new Date().toISOString();
    queryClient.setQueryData(getListEntriesQueryKey(), {
      entries: updated.map(e => ({ ...localToApi(e), createdAt: now, updatedAt: now })),
    });

    deleteMutation.mutate({ clientId: String(id) });
  }, [queryClient, deleteMutation]);

  return { entries, isLoaded: !isLoading, addOrUpdateEntry, deleteEntry };
}
