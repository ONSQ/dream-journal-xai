import { useState, useEffect } from "react";

export type JournalMode = 'vigilant' | 'restored';

export interface JournalEntry {
  id: number;
  date: string;
  mode: JournalMode;
  phase: string;
  data: Record<string, any>;
}

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dream-entries');
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load entries', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    try {
      localStorage.setItem('dream-entries', JSON.stringify(newEntries));
    } catch (e) {
      console.error('Failed to save entries', e);
    }
  };

  const addOrUpdateEntry = (entry: JournalEntry) => {
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    const newEntries = existingIndex >= 0 
      ? entries.map(e => e.id === entry.id ? entry : e)
      : [...entries, entry];
    saveEntries(newEntries);
  };

  const deleteEntry = (id: number) => {
    const newEntries = entries.filter(e => e.id !== id);
    saveEntries(newEntries);
  };

  return {
    entries,
    isLoaded,
    addOrUpdateEntry,
    deleteEntry
  };
}
