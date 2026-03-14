import { useState, useCallback, useRef } from "react";
import { classifyText } from "../lib/api";
import type { BulkItem, XAIResult, Dimension } from "../lib/types";
import { DIMENSION_COLORS, DIMENSIONS } from "../lib/colors";

const CONCURRENCY = 3;

function parseBulkText(raw: string): string[] {
  if (raw.includes("---")) {
    return raw.split(/---+/).map((s) => s.trim()).filter(Boolean);
  }
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1 && lines.every((l) => l.includes(","))) {
    return lines.map((l) => {
      const parts = l.split(",");
      return parts.length > 1 ? parts.slice(1).join(",").replace(/^"|"$/g, "").trim() : l;
    }).filter(Boolean);
  }
  return [raw.trim()].filter(Boolean);
}

export function BulkInput() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<BulkItem[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleRun = useCallback(async () => {
    const texts = parseBulkText(raw);
    if (texts.length === 0) return;

    abortRef.current = false;
    const newItems: BulkItem[] = texts.map((text, i) => ({
      id: `bulk-${i}`,
      text,
      status: "pending",
    }));
    setItems(newItems);
    setRunning(true);
    setSelectedId(null);

    const queue = [...newItems.map((_, i) => i)];
    const results = [...newItems];

    async function processNext() {
      while (queue.length > 0 && !abortRef.current) {
        const idx = queue.shift()!;
        results[idx] = { ...results[idx], status: "classifying" };
        setItems([...results]);
        try {
          const r = await classifyText(results[idx].text);
          results[idx] = { ...results[idx], status: "done", result: r };
        } catch (err) {
          results[idx] = {
            ...results[idx],
            status: "error",
            error: err instanceof Error ? err.message : "Failed",
          };
        }
        setItems([...results]);
      }
    }

    const workers = Array.from({ length: Math.min(CONCURRENCY, texts.length) }, () => processNext());
    await Promise.all(workers);
    setRunning(false);
  }, [raw]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
  }, []);

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const total = items.length;
  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-border space-y-3">
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Bulk Classification
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste multiple dream texts separated by <code className="bg-secondary px-1 rounded">---</code> or
          as CSV rows (column 2+). Up to {CONCURRENCY} concurrent requests.
        </p>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"I dreamed of angels singing in a golden temple...\n---\nI was running from a dark figure through an endless hallway...\n---\nI was at work doing paperwork and talking to my coworker about lunch..."}
          rows={5}
          className="w-full bg-secondary rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary font-mono"
          disabled={running}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {parseBulkText(raw).length} texts detected
          </span>
          <div className="flex gap-2">
            {running && (
              <button
                onClick={handleStop}
                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Stop
              </button>
            )}
            <button
              onClick={handleRun}
              disabled={running || !raw.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {running ? `Classifying ${doneCount + errorCount}/${total}...` : "Classify All"}
            </button>
          </div>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-emerald-400">{doneCount} done</span>
            {errorCount > 0 && <span className="text-red-400">{errorCount} failed</span>}
            <span>{total - doneCount - errorCount} remaining</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((doneCount + errorCount) / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Enter texts above and classify to see results as a card grid.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <BulkCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onSelect={() => setSelectedId(item.id === selectedId ? null : item.id)}
              />
            ))}
          </div>
        )}

        {selected?.result && (
          <div className="mt-6 border border-border rounded-xl bg-card">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Detail: {selected.text.slice(0, 60)}...</h3>
            </div>
            <div className="p-4 space-y-4">
              <ProbabilityBarsSmall result={selected.result} />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{selected.result.sourceInfo.icon} {selected.result.sourceInfo.title}</span>
                <span className="mx-2">·</span>
                <span>{selected.result.wordCount} words</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BulkCard({ item, isSelected, onSelect }: { item: BulkItem; isSelected: boolean; onSelect: () => void }) {
  const topDim = item.result
    ? (Object.entries(item.result.probabilities) as [Dimension, number][]).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <button
      onClick={onSelect}
      className={`text-left p-3 rounded-lg border transition-all ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.text}</p>
      {item.status === "classifying" && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Classifying...
        </div>
      )}
      {item.status === "error" && (
        <p className="text-xs text-red-400">{item.error}</p>
      )}
      {item.status === "done" && item.result && (
        <>
          <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mb-1">
            {DIMENSIONS.map((dim) => (
              <div
                key={dim}
                className="h-full"
                style={{
                  width: `${item.result!.probabilities[dim] * 100}%`,
                  backgroundColor: DIMENSION_COLORS[dim].bar,
                }}
              />
            ))}
          </div>
          {topDim && (
            <span className={`text-[10px] font-semibold ${DIMENSION_COLORS[topDim[0]].text}`}>
              {topDim[0]} {(topDim[1] * 100).toFixed(0)}%
            </span>
          )}
        </>
      )}
      {item.status === "pending" && (
        <span className="text-xs text-muted-foreground">Pending</span>
      )}
    </button>
  );
}

function ProbabilityBarsSmall({ result }: { result: XAIResult }) {
  return (
    <div className="space-y-1.5">
      {DIMENSIONS.map((dim) => (
        <div key={dim} className="flex items-center gap-2">
          <span className={`text-[10px] w-12 ${DIMENSION_COLORS[dim].text}`}>{dim.slice(0, 5)}</span>
          <div className="flex-1 h-2 rounded bg-secondary overflow-hidden">
            <div
              className="h-full rounded"
              style={{
                width: `${result.probabilities[dim] * 100}%`,
                backgroundColor: DIMENSION_COLORS[dim].bar,
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
            {(result.probabilities[dim] * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
