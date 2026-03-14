import { useListEntries as useListEntriesBase, useClassifyDream as useClassifyDreamBase, classifyDream as classifyDreamBase } from "@workspace/api-client-react";
import type { XAIResult, JournalEntry } from "./types";

export function useEntries() {
  const query = useListEntriesBase();
  const entries: JournalEntry[] = (query.data?.entries ?? []).map((e) => ({
    clientId: e.clientId,
    mode: e.mode,
    phase: e.phase,
    entryDate: e.entryDate,
    data: e.data as JournalEntry["data"],
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return {
    entries,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export function useClassify() {
  const mutation = useClassifyDreamBase();
  return {
    classify: async (text: string): Promise<XAIResult> => {
      const r = await mutation.mutateAsync({ data: { text } });
      return r as XAIResult;
    },
    isPending: mutation.isPending,
  };
}

export async function classifyText(text: string): Promise<XAIResult> {
  const r = await classifyDreamBase({ text });
  return r as XAIResult;
}
