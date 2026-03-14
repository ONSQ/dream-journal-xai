import { useState, useMemo } from "react";
import type { TokenFeature, Dimension } from "../lib/types";
import { DIMENSION_COLORS } from "../lib/colors";

interface Props {
  title: string;
  method: "SHAP" | "LIME";
  features: Record<Dimension, TokenFeature[]>;
  agreement: Record<Dimension, number>;
}

type SortKey = "word" | "rawWeight" | "weight" | "negated";
type SortDir = "asc" | "desc";

export function FeatureTable({ title, method, features, agreement }: Props) {
  const dims: Dimension[] = ["Spiritual", "Trauma", "Maintenance"];
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeDim, setActiveDim] = useState<Dimension>("Spiritual");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedFeatures = useMemo(() => {
    const feats = [...(features[activeDim] || [])];
    feats.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "word") cmp = a.word.localeCompare(b.word);
      else if (sortKey === "rawWeight") cmp = (a.rawWeight ?? a.weight) - (b.rawWeight ?? b.weight);
      else if (sortKey === "weight") cmp = Math.abs(a.weight) - Math.abs(b.weight);
      else if (sortKey === "negated") cmp = (a.negated ? 1 : 0) - (b.negated ? 1 : 0);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return feats;
  }, [features, activeDim, sortKey, sortDir]);

  const otherMethodKey = method === "SHAP" ? "lime" : "shap";
  const colors = DIMENSION_COLORS[activeDim];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
          {method}
        </span>
      </div>

      <div className="flex gap-1 mb-2">
        {dims.map((dim) => {
          const dc = DIMENSION_COLORS[dim];
          return (
            <button
              key={dim}
              onClick={() => setActiveDim(dim)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeDim === dim
                  ? `${dc.bg} ${dc.text} border ${dc.border}`
                  : "text-muted-foreground hover:text-foreground bg-secondary"
              }`}
            >
              {dim}
              <span className="ml-1 opacity-60 font-mono">({(agreement[dim] * 100).toFixed(0)}%)</span>
            </button>
          );
        })}
      </div>

      <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
        <table className="w-full text-xs">
          <thead>
            <tr className={`${colors.bg} border-b ${colors.border}`}>
              <SortHeader label="Keyword" sortKey="word" current={sortKey} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Raw Wt" sortKey="rawWeight" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader
                label={method === "SHAP" ? "SHAP Wt" : "LIME Δ"}
                sortKey="weight"
                current={sortKey}
                dir={sortDir}
                onClick={handleSort}
                align="right"
              />
              <SortHeader label="Negated" sortKey="negated" current={sortKey} dir={sortDir} onClick={handleSort} align="center" />
              <th className="px-3 py-2 text-right text-muted-foreground font-medium">Bar</th>
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground italic">
                  No features detected
                </td>
              </tr>
            ) : (
              sortedFeatures.map((f, i) => {
                const maxWeight = Math.max(
                  ...sortedFeatures.map((sf) => Math.abs(sf.weight)),
                  0.001
                );
                return (
                  <tr
                    key={i}
                    className={`border-b border-border/30 ${f.negated ? "opacity-50" : ""} hover:bg-white/5`}
                  >
                    <td className={`px-3 py-1.5 font-mono ${f.negated ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {f.word}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                      {(f.rawWeight ?? f.weight).toFixed(2)}
                    </td>
                    <td className={`px-3 py-1.5 text-right font-mono ${f.negated ? "text-muted-foreground" : colors.text}`}>
                      {f.weight >= 0 ? "+" : ""}{f.weight.toFixed(3)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {f.negated ? (
                        <span className="text-amber-400 text-[10px] font-medium">NEG</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="w-full h-2.5 rounded bg-black/20 overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${f.negated ? 0 : (Math.abs(f.weight) / maxWeight) * 100}%`,
                            backgroundColor: f.weight >= 0 ? colors.bar : "#ef4444",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = current === sortKey;
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th
      className={`px-3 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none ${alignClass}`}
      onClick={() => onClick(sortKey)}
    >
      {label}
      {isActive && (
        <span className="ml-0.5 text-primary">{dir === "desc" ? "↓" : "↑"}</span>
      )}
    </th>
  );
}
