import type { Dimension } from "./types";

export const DIMENSION_COLORS: Record<Dimension, { bar: string; bg: string; text: string; border: string; ci: string }> = {
  Spiritual: {
    bar: "#818cf8",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    ci: "rgba(129,140,248,0.2)",
  },
  Trauma: {
    bar: "#f87171",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    ci: "rgba(248,113,113,0.2)",
  },
  Maintenance: {
    bar: "#34d399",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    ci: "rgba(52,211,153,0.2)",
  },
};

export const DIMENSIONS: Dimension[] = ["Spiritual", "Trauma", "Maintenance"];
