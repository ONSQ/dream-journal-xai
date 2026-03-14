import type { XAIResult } from "../lib/types";
import { ProbabilityBars } from "./ProbabilityBars";
import { FeatureTable } from "./FeatureTable";
import { CounterfactualCards } from "./CounterfactualCards";
import { MetadataPanel } from "./MetadataPanel";

interface Props {
  result: XAIResult;
  title?: string;
  narrative?: string;
}

export function XAIDetailPanel({ result, title, narrative }: Props) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {(title || narrative) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-bold text-foreground font-[var(--font-display)]">{title}</h2>}
          {narrative && (
            <p className="text-sm text-muted-foreground line-clamp-3">{narrative}</p>
          )}
        </div>
      )}

      <ProbabilityBars result={result} />
      <FeatureTable title="SHAP Feature Attribution" method="SHAP" features={result.shap} agreement={result.agreement} />
      <FeatureTable title="LIME Local Explanation" method="LIME" features={result.lime} agreement={result.agreement} />
      <CounterfactualCards counterfactuals={result.counterfactuals} />
      <MetadataPanel result={result} />
    </div>
  );
}
