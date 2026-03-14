import type { XAIResult, JournalEntry } from "./types";

const API_BASE = "/api";

export async function classifyText(text: string): Promise<XAIResult> {
  const res = await fetch(`${API_BASE}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Classification failed: ${res.statusText}`);
  return res.json();
}

export async function fetchEntries(): Promise<JournalEntry[]> {
  const res = await fetch(`${API_BASE}/entries`);
  if (!res.ok) throw new Error(`Failed to fetch entries: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.entries || []);
}
