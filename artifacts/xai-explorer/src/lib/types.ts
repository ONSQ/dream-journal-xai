export interface TokenFeature {
  word: string;
  weight: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  adequate: boolean;
}

export interface Counterfactual {
  remove: string;
  newProbability: number;
  delta: number;
  explanation: string;
}

export type Dimension = "Spiritual" | "Trauma" | "Maintenance";

export interface XAIResult {
  probabilities: Record<Dimension, number>;
  shap: Record<Dimension, TokenFeature[]>;
  lime: Record<Dimension, TokenFeature[]>;
  agreement: Record<Dimension, number>;
  confidenceIntervals: Record<Dimension, ConfidenceInterval>;
  counterfactuals: Record<Dimension, Counterfactual[]>;
  sourceType: string;
  sourceInfo: {
    title: string;
    icon: string;
    color: string;
    guidance: string;
  };
  interpretation: string;
  dimensionInterpretations: Record<Dimension, string>;
  wordCount: number;
  negationsDetected: number;
  fieldWeighting: boolean;
}

export interface JournalEntry {
  id: number;
  clientId: string;
  mode: string;
  phase: string;
  entryDate: string;
  data: Record<string, unknown> & { _classification?: XAIResult; title?: string; narrative?: string };
  createdAt: string;
  updatedAt: string;
}

export interface BulkItem {
  id: string;
  text: string;
  status: "pending" | "classifying" | "done" | "error";
  result?: XAIResult;
  error?: string;
}
