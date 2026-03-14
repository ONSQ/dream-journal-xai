import type {
  ClassifyResponse,
  FeatureWeight,
  ConfidenceInterval,
  Counterfactual,
  JournalEntry as GeneratedJournalEntry,
  JournalEntryData,
} from "@workspace/api-client-react/src/generated/api.schemas";

export type TokenFeature = FeatureWeight;

export type { ConfidenceInterval, Counterfactual };

export type Dimension = "Spiritual" | "Trauma" | "Maintenance";

export type XAIResult = ClassifyResponse;

export interface JournalEntry extends Omit<GeneratedJournalEntry, 'data'> {
  id?: number;
  data: JournalEntryData & {
    _classification?: XAIResult;
    title?: string;
    narrative?: string;
  };
}

export interface BulkItem {
  id: string;
  text: string;
  status: "pending" | "classifying" | "done" | "error";
  result?: XAIResult;
  error?: string;
}
