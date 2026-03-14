import { useState, useMemo } from "react";
import type { JournalEntry, Dimension } from "../lib/types";
import { DIMENSION_COLORS } from "../lib/colors";

const MODE_LABELS: Record<string, string> = {
  vigilant: "Dream",
  restored: "Healing",
  dream: "Dream",
  healing: "Healing",
};

interface Props {
  entries: JournalEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function EntryList({ entries, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = new Date(a.entryDate).getTime();
      const db = new Date(b.entryDate).getTime();
      return db - da;
    });
  }, [entries]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((e) => {
      const title = (e.data?.title as string) || "";
      const narrative = (e.data?.narrative as string) || "";
      return title.toLowerCase().includes(q) || narrative.toLowerCase().includes(q);
    });
  }, [sorted, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-secondary rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {entries.length === 0 ? "No journal entries found. Create entries in the main journal app." : "No matching entries."}
          </div>
        ) : (
          filtered.map((entry) => {
            const cls = entry.data?._classification;
            const title = (entry.data?.title as string) || "Untitled";
            const isSelected = entry.clientId === selectedId;
            const topDim = cls ? (Object.entries(cls.probabilities) as [Dimension, number][])
              .sort((a, b) => b[1] - a[1])[0] : null;
            const modeLabel = MODE_LABELS[entry.mode] || entry.mode;

            return (
              <button
                key={entry.clientId}
                onClick={() => onSelect(entry.clientId)}
                className={`w-full text-left p-3 border-b border-border transition-colors ${
                  isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-secondary/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {modeLabel} · {entry.entryDate.split("T")[0]}
                    </p>
                  </div>
                  {topDim && cls && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DIMENSION_COLORS[topDim[0]].bg} ${DIMENSION_COLORS[topDim[0]].text}`}
                    >
                      {(topDim[1] * 100).toFixed(0)}% {topDim[0].slice(0, 4)}
                    </span>
                  )}
                </div>
                {cls && (
                  <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden">
                    {(["Spiritual", "Trauma", "Maintenance"] as Dimension[]).map((dim) => (
                      <div
                        key={dim}
                        className="h-full transition-all"
                        style={{
                          width: `${cls.probabilities[dim] * 100}%`,
                          backgroundColor: DIMENSION_COLORS[dim].bar,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
