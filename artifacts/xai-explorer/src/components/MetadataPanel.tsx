import type { XAIResult } from "../lib/types";

interface Props {
  result: XAIResult;
}

export function MetadataPanel({ result }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Classification Metadata
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <InfoCard label="Source Type" value={result.sourceInfo.title} icon={result.sourceInfo.icon} />
        <InfoCard label="Word Count" value={String(result.wordCount)} sub={result.wordCount < 30 ? "Below 30-word threshold" : "Adequate"} />
        <InfoCard label="Negations" value={String(result.negationsDetected)} sub="Keywords negated" />
        <InfoCard label="Field Weighting" value={result.fieldWeighting ? "Multi-field" : "Single text"} />
        <InfoCard label="Model Version" value="v1.0-keyword" sub="Lexicon-based classifier" />
      </div>
      <div className={`rounded-lg border p-3 ${
        result.sourceInfo.color === "indigo" ? "border-indigo-500/30 bg-indigo-500/5" :
        result.sourceInfo.color === "red" ? "border-red-500/30 bg-red-500/5" :
        result.sourceInfo.color === "green" ? "border-emerald-500/30 bg-emerald-500/5" :
        result.sourceInfo.color === "purple" ? "border-purple-500/30 bg-purple-500/5" :
        "border-slate-500/30 bg-slate-500/5"
      }`}>
        <p className="text-xs font-medium text-muted-foreground mb-1">Guidance</p>
        <p className="text-sm text-foreground leading-relaxed">{result.sourceInfo.guidance}</p>
      </div>
      <div className="rounded-lg border border-border bg-secondary/50 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">Full Interpretation</p>
        <p className="text-sm text-foreground leading-relaxed">{result.interpretation}</p>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon, sub }: { label: string; value: string; icon?: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
