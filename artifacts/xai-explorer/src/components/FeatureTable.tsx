import type { TokenFeature, Dimension } from "../lib/types";
import { DIMENSION_COLORS } from "../lib/colors";

interface Props {
  title: string;
  method: "SHAP" | "LIME";
  features: Record<Dimension, TokenFeature[]>;
  agreement: Record<Dimension, number>;
}

export function FeatureTable({ title, method, features, agreement }: Props) {
  const dims: Dimension[] = ["Spiritual", "Trauma", "Maintenance"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
          {method}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dims.map((dim) => {
          const colors = DIMENSION_COLORS[dim];
          const feats = features[dim] || [];
          const maxWeight = Math.max(...feats.map((f) => Math.abs(f.weight)), 0.001);
          const agr = agreement[dim];

          return (
            <div key={dim} className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${colors.text}`}>{dim}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  agr: {(agr * 100).toFixed(0)}%
                </span>
              </div>
              {feats.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No features detected</p>
              ) : (
                <div className="space-y-1">
                  {feats.slice(0, 6).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono w-16 truncate" title={f.word}>
                        {f.word}
                      </span>
                      <div className="flex-1 h-3 rounded bg-black/20 overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${(Math.abs(f.weight) / maxWeight) * 100}%`,
                            backgroundColor: f.weight >= 0 ? colors.bar : "#ef4444",
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
                        {f.weight >= 0 ? "+" : ""}
                        {f.weight.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
