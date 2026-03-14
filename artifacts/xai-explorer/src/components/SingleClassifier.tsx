import { useState, useCallback } from "react";
import type { XAIResult } from "../lib/types";
import { useClassify } from "../lib/api-hooks";
import { XAIDetailPanel } from "./XAIDetailPanel";

interface Props {
  onResult?: (result: XAIResult, text: string) => void;
}

export function SingleClassifier({ onResult }: Props) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<XAIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { classify, isPending } = useClassify();

  const handleClassify = useCallback(async () => {
    if (!text.trim()) return;
    setError(null);
    try {
      const r = await classify(text);
      setResult(r);
      onResult?.(r, text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Classification failed");
    }
  }, [text, onResult, classify]);

  const loading = isPending;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-border space-y-3">
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Single Text Classifier
        </h2>
        <p className="text-sm text-muted-foreground">
          Paste or type a dream narrative below. The model classifies it across Spiritual, Trauma, and
          Maintenance dimensions with full XAI output.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I dreamed I was walking through a garden filled with golden light. A voice said 'Do not be afraid, for I am with you always.' I felt an overwhelming sense of peace and saw white doves circling above..."
          rows={5}
          className="w-full bg-secondary rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary font-mono"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {text.trim().split(/\s+/).filter(Boolean).length} words
            {text.trim().split(/\s+/).filter(Boolean).length < 30 && text.trim().length > 0 && (
              <span className="text-amber-400 ml-1">· Add more for better confidence</span>
            )}
          </span>
          <button
            onClick={handleClassify}
            disabled={loading || !text.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? "Classifying..." : "Classify"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {result && <XAIDetailPanel result={result} />}
        {!result && !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Enter text above and click Classify to see XAI output.
          </div>
        )}
      </div>
    </div>
  );
}
