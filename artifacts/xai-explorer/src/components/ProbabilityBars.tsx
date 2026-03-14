import type { XAIResult, Dimension } from "../lib/types";
import { DIMENSION_COLORS, DIMENSIONS } from "../lib/colors";

interface Props {
  result: XAIResult;
}

export function ProbabilityBars({ result }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Classification Probabilities
      </h3>
      {DIMENSIONS.map((dim) => {
        const prob = result.probabilities[dim];
        const ci = result.confidenceIntervals[dim];
        const colors = DIMENSION_COLORS[dim];
        const pct = (prob * 100).toFixed(1);
        const ciLower = (ci.lower * 100).toFixed(0);
        const ciUpper = (ci.upper * 100).toFixed(0);

        return (
          <div key={dim} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${colors.text}`}>{dim}</span>
              <span className="text-muted-foreground font-mono text-xs">
                {pct}% <span className="opacity-60">({ciLower}–{ciUpper}%)</span>
              </span>
            </div>
            <div className="relative h-6 rounded-md overflow-hidden bg-secondary">
              <div
                className="absolute inset-y-0 left-0 rounded-md opacity-20"
                style={{
                  left: `${ci.lower * 100}%`,
                  width: `${(ci.upper - ci.lower) * 100}%`,
                  backgroundColor: colors.bar,
                }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                style={{
                  width: `${prob * 100}%`,
                  backgroundColor: colors.bar,
                }}
              />
              {!ci.adequate && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 font-medium">
                  LOW CONF
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
        <span className="inline-block w-3 h-2 rounded-sm opacity-30 bg-muted-foreground" />
        <span>Shaded region = 95% confidence interval</span>
      </div>
    </div>
  );
}
