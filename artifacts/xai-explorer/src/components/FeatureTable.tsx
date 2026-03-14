import { useState, useMemo } from "react";
import type { TokenFeature, Dimension } from "../lib/types";
import { DIMENSION_COLORS } from "../lib/colors";

interface JoinedFeature {
  word: string;
  rawWeight: number;
  shapWeight: number;
  limeDelta: number;
  difference: number;
  negated: boolean;
}

interface Props {
  shapFeatures: Record<Dimension, TokenFeature[]>;
  limeFeatures: Record<Dimension, TokenFeature[]>;
  agreement: Record<Dimension, number>;
}

type SortKey = "word" | "rawWeight" | "shapWeight" | "limeDelta" | "difference" | "negated";
type SortDir = "asc" | "desc";

function joinFeatures(
  shap: TokenFeature[],
  lime: TokenFeature[]
): JoinedFeature[] {
  const limeMap = new Map(lime.map((f) => [f.word, f]));
  const allWords = new Set([...shap.map((f) => f.word), ...lime.map((f) => f.word)]);
  const joined: JoinedFeature[] = [];

  for (const word of allWords) {
    const shapEntry = shap.find((f) => f.word === word);
    const limeEntry = limeMap.get(word);
    const shapWeight = shapEntry?.weight ?? 0;
    const limeDelta = limeEntry?.weight ?? 0;
    joined.push({
      word,
      rawWeight: shapEntry?.rawWeight ?? limeEntry?.rawWeight ?? 0,
      shapWeight,
      limeDelta,
      difference: +(limeDelta - shapWeight).toFixed(4),
      negated: shapEntry?.negated ?? limeEntry?.negated ?? false,
    });
  }

  return joined.sort((a, b) => Math.abs(b.shapWeight) - Math.abs(a.shapWeight));
}

export function FeatureTable({ shapFeatures, limeFeatures, agreement }: Props) {
  const dims: Dimension[] = ["Spiritual", "Trauma", "Maintenance"];
  const [sortKey, setSortKey] = useState<SortKey>("shapWeight");
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

  const joined = useMemo(
    () => joinFeatures(shapFeatures[activeDim] || [], limeFeatures[activeDim] || []),
    [shapFeatures, limeFeatures, activeDim]
  );

  const sorted = useMemo(() => {
    const feats = [...joined];
    feats.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "word") cmp = a.word.localeCompare(b.word);
      else if (sortKey === "rawWeight") cmp = a.rawWeight - b.rawWeight;
      else if (sortKey === "shapWeight") cmp = Math.abs(a.shapWeight) - Math.abs(b.shapWeight);
      else if (sortKey === "limeDelta") cmp = Math.abs(a.limeDelta) - Math.abs(b.limeDelta);
      else if (sortKey === "difference") cmp = Math.abs(a.difference) - Math.abs(b.difference);
      else if (sortKey === "negated") cmp = (a.negated ? 1 : 0) - (b.negated ? 1 : 0);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return feats;
  }, [joined, sortKey, sortDir]);

  const colors = DIMENSION_COLORS[activeDim];
  const maxShap = Math.max(...sorted.map((f) => Math.abs(f.shapWeight)), 0.001);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Feature Attribution (SHAP + LIME)
        </h3>
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
              <span className="ml-1 opacity-60 font-mono">agr:{(agreement[dim] * 100).toFixed(0)}%</span>
            </button>
          );
        })}
      </div>

      <div className={`rounded-lg border ${colors.border} overflow-x-auto`}>
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className={`${colors.bg} border-b ${colors.border}`}>
              <SortHeader label="Keyword" sortKey="word" current={sortKey} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Raw Wt" sortKey="rawWeight" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="SHAP Wt" sortKey="shapWeight" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="LIME Δ" sortKey="limeDelta" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="Diff" sortKey="difference" current={sortKey} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="Negated" sortKey="negated" current={sortKey} dir={sortDir} onClick={handleSort} align="center" />
              <th className="px-3 py-2 text-right text-muted-foreground font-medium">SHAP Bar</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground italic">
                  No features detected
                </td>
              </tr>
            ) : (
              sorted.map((f, i) => (
                <tr
                  key={i}
                  className={`border-b border-border/30 ${f.negated ? "opacity-50" : ""} hover:bg-white/5`}
                >
                  <td className={`px-3 py-1.5 font-mono ${f.negated ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {f.word}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                    {f.rawWeight.toFixed(2)}
                  </td>
                  <td className={`px-3 py-1.5 text-right font-mono ${f.negated ? "text-muted-foreground" : colors.text}`}>
                    {f.shapWeight >= 0 ? "+" : ""}{f.shapWeight.toFixed(3)}
                  </td>
                  <td className={`px-3 py-1.5 text-right font-mono ${f.limeDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {f.limeDelta >= 0 ? "+" : ""}{f.limeDelta.toFixed(3)}
                  </td>
                  <td className={`px-3 py-1.5 text-right font-mono ${
                    Math.abs(f.difference) < 0.01 ? "text-muted-foreground" :
                    f.difference > 0 ? "text-amber-400" : "text-cyan-400"
                  }`}>
                    {f.difference >= 0 ? "+" : ""}{f.difference.toFixed(3)}
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
                          width: `${f.negated ? 0 : (Math.abs(f.shapWeight) / maxShap) * 100}%`,
                          backgroundColor: f.shapWeight >= 0 ? colors.bar : "#ef4444",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
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
