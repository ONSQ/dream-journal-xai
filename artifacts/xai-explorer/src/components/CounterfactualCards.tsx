import type { Counterfactual, Dimension } from "../lib/types";
import { DIMENSION_COLORS, DIMENSIONS } from "../lib/colors";

interface Props {
  counterfactuals: Record<Dimension, Counterfactual[]>;
}

export function CounterfactualCards({ counterfactuals }: Props) {
  const hasAny = DIMENSIONS.some((d) => counterfactuals[d]?.length > 0);
  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Counterfactual Analysis
      </h3>
      <p className="text-xs text-muted-foreground">
        "What if this word were removed?" — shows how individual keywords shift the classification.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DIMENSIONS.map((dim) => {
          const cfs = counterfactuals[dim] || [];
          const colors = DIMENSION_COLORS[dim];
          if (cfs.length === 0) return null;

          return (
            <div key={dim} className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
              <span className={`text-xs font-semibold ${colors.text} block mb-2`}>{dim}</span>
              <div className="space-y-2">
                {cfs.map((cf, i) => (
                  <div key={i} className="rounded bg-black/20 p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                        −"{cf.remove}"
                      </span>
                      <span className={`text-[10px] font-mono ${cf.delta < 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {cf.delta > 0 ? "+" : ""}
                        {(cf.delta * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{cf.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
