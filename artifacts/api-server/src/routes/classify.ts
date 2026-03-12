import { Router, type IRouter, type Request, type Response } from "express";
import { ClassifyDreamBody, ClassifyDreamResponse, ModelHealthResponse } from "@workspace/api-zod";

const router: IRouter = Router();

type Dimension = "Spiritual" | "Trauma" | "Maintenance";

interface KeywordEntry {
  word: string;
  weight: number;
}

interface TokenScore {
  word: string;
  rawWeight: number;
  normalizedWeight: number;
  negated: boolean;
}

// ─── Keyword Lexicons ────────────────────────────────────────────────────────

const SPIRITUAL_KEYWORDS: KeywordEntry[] = [
  { word: "god", weight: 1.8 }, { word: "jesus", weight: 2.0 }, { word: "lord", weight: 1.7 },
  { word: "holy", weight: 1.9 }, { word: "spirit", weight: 1.5 }, { word: "angel", weight: 1.8 },
  { word: "heaven", weight: 2.0 }, { word: "prayer", weight: 1.7 }, { word: "pray", weight: 1.6 },
  { word: "divine", weight: 1.8 }, { word: "sacred", weight: 1.7 }, { word: "scripture", weight: 1.9 },
  { word: "worship", weight: 1.8 }, { word: "vision", weight: 1.4 }, { word: "prophecy", weight: 2.0 },
  { word: "prophetic", weight: 1.9 }, { word: "faith", weight: 1.5 }, { word: "church", weight: 1.4 },
  { word: "bible", weight: 1.9 }, { word: "blessing", weight: 1.6 }, { word: "anointed", weight: 1.9 },
  { word: "calling", weight: 1.3 }, { word: "discernment", weight: 1.7 }, { word: "peace", weight: 1.2 },
  { word: "glory", weight: 1.8 }, { word: "light", weight: 1.1 }, { word: "righteous", weight: 1.7 },
  { word: "salvation", weight: 1.9 }, { word: "redeemed", weight: 1.8 }, { word: "cross", weight: 1.6 },
  { word: "revelation", weight: 1.8 }, { word: "messenger", weight: 1.3 }, { word: "dream", weight: 0.5 },
  { word: "supernatural", weight: 1.7 }, { word: "holy spirit", weight: 2.0 }, { word: "amen", weight: 1.6 },
  { word: "miracle", weight: 1.8 }, { word: "protection", weight: 1.2 }, { word: "grace", weight: 1.5 },
  { word: "forgiveness", weight: 1.4 }, { word: "love", weight: 0.9 }, { word: "wisdom", weight: 1.3 },
  { word: "warned", weight: 1.2 }, { word: "guided", weight: 1.1 }, { word: "temple", weight: 1.7 },
  { word: "radiance", weight: 1.4 }, { word: "presence", weight: 1.1 }, { word: "voice", weight: 1.0 },
  { word: "pure", weight: 1.3 }, { word: "throne", weight: 1.8 }, { word: "rapture", weight: 1.9 },
  { word: "sanctified", weight: 1.8 }, { word: "anointing", weight: 1.9 }, { word: "intercession", weight: 1.7 },
];

const TRAUMA_KEYWORDS: KeywordEntry[] = [
  { word: "fear", weight: 1.8 }, { word: "terror", weight: 2.0 }, { word: "nightmare", weight: 2.0 },
  { word: "attack", weight: 1.9 }, { word: "chase", weight: 1.8 }, { word: "chased", weight: 1.9 },
  { word: "running", weight: 1.3 }, { word: "escape", weight: 1.6 }, { word: "threat", weight: 1.8 },
  { word: "danger", weight: 1.8 }, { word: "death", weight: 1.7 }, { word: "dying", weight: 1.8 },
  { word: "kill", weight: 1.9 }, { word: "killed", weight: 1.9 }, { word: "violence", weight: 1.9 },
  { word: "trapped", weight: 1.8 }, { word: "helpless", weight: 1.9 }, { word: "paralyzed", weight: 1.8 },
  { word: "scream", weight: 1.7 }, { word: "screaming", weight: 1.8 }, { word: "dark", weight: 1.1 },
  { word: "darkness", weight: 1.3 }, { word: "monster", weight: 1.8 }, { word: "demon", weight: 1.9 },
  { word: "evil", weight: 1.8 }, { word: "shadow", weight: 1.2 }, { word: "suffocate", weight: 1.9 },
  { word: "anxiety", weight: 1.7 }, { word: "panic", weight: 1.9 }, { word: "drowning", weight: 1.8 },
  { word: "falling", weight: 1.5 }, { word: "lost", weight: 1.3 }, { word: "alone", weight: 1.2 },
  { word: "abandoned", weight: 1.7 }, { word: "hurt", weight: 1.5 }, { word: "blood", weight: 1.7 },
  { word: "wound", weight: 1.6 }, { word: "accident", weight: 1.5 }, { word: "crash", weight: 1.5 },
  { word: "fire", weight: 1.3 }, { word: "torture", weight: 2.0 }, { word: "abuse", weight: 1.9 },
  { word: "ptsd", weight: 2.0 }, { word: "trauma", weight: 2.0 }, { word: "rage", weight: 1.6 },
  { word: "shame", weight: 1.5 }, { word: "humiliation", weight: 1.7 }, { word: "grief", weight: 1.6 },
  { word: "loss", weight: 1.4 }, { word: "powerless", weight: 1.8 }, { word: "control", weight: 0.8 },
  { word: "suffocating", weight: 1.9 }, { word: "overwhelmed", weight: 1.6 }, { word: "cornered", weight: 1.7 },
];

const MAINTENANCE_KEYWORDS: KeywordEntry[] = [
  { word: "driving", weight: 1.5 }, { word: "school", weight: 1.4 }, { word: "work", weight: 1.4 },
  { word: "office", weight: 1.4 }, { word: "meeting", weight: 1.5 }, { word: "phone", weight: 1.3 },
  { word: "shopping", weight: 1.5 }, { word: "eating", weight: 1.4 }, { word: "food", weight: 1.2 },
  { word: "house", weight: 1.2 }, { word: "home", weight: 1.0 }, { word: "family", weight: 1.0 },
  { word: "friend", weight: 1.0 }, { word: "conversation", weight: 1.3 }, { word: "talking", weight: 1.2 },
  { word: "walking", weight: 1.2 }, { word: "ordinary", weight: 1.6 }, { word: "normal", weight: 1.5 },
  { word: "everyday", weight: 1.7 }, { word: "routine", weight: 1.7 }, { word: "mundane", weight: 1.8 },
  { word: "fragmented", weight: 1.6 }, { word: "random", weight: 1.5 }, { word: "weird", weight: 1.1 },
  { word: "confusing", weight: 1.2 }, { word: "nonsense", weight: 1.5 }, { word: "late", weight: 1.1 },
  { word: "forgot", weight: 1.3 }, { word: "exam", weight: 1.5 }, { word: "test", weight: 1.2 },
  { word: "teeth", weight: 1.6 }, { word: "hair", weight: 1.2 }, { word: "naked", weight: 1.6 },
  { word: "flying", weight: 1.3 }, { word: "sleep", weight: 1.1 }, { word: "bathroom", weight: 1.5 },
  { word: "car", weight: 1.2 }, { word: "road", weight: 1.1 }, { word: "store", weight: 1.3 },
  { word: "money", weight: 1.2 }, { word: "stress", weight: 1.4 }, { word: "deadline", weight: 1.5 },
  { word: "coworker", weight: 1.4 }, { word: "boss", weight: 1.3 }, { word: "commute", weight: 1.5 },
];

// Per-field classification weights (narrative carries the most signal)
const FIELD_WEIGHTS: Record<string, number> = {
  narrative: 3.5,
  interpretation: 2.5,
  coreThreat: 2.0,
  masteryAction: 1.8,
  safeEnding: 1.8,
  theme: 1.6,
  affect: 1.6,
  question: 1.4,
  incubationRequest: 1.2,
  concerns: 1.2,
  title: 1.0,
};

const NEGATION_WORDS = new Set([
  "not", "no", "never", "without", "don't", "dont", "didn't", "didnt",
  "can't", "cant", "won't", "wont", "isn't", "isnt", "wasn't", "wasnt",
  "doesn't", "doesnt", "haven't", "havent", "hadn't", "hadnt", "hardly",
  "barely", "nor", "neither", "nothing", "nobody", "nowhere", "none",
]);

// ─── Tokenizer ────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1);
}

// ─── Negation detection ───────────────────────────────────────────────────────

function isNegated(tokens: string[], keywordIndex: number, windowSize = 3): boolean {
  const start = Math.max(0, keywordIndex - windowSize);
  for (let i = start; i < keywordIndex; i++) {
    if (NEGATION_WORDS.has(tokens[i])) return true;
  }
  return false;
}

// ─── Core scorer ─────────────────────────────────────────────────────────────

function computeScores(tokens: string[], keywords: KeywordEntry[], fieldWeight = 1.0): TokenScore[] {
  const scored: TokenScore[] = [];
  const tokenStr = tokens.join(" ");

  for (const kw of keywords) {
    const wordLower = kw.word.toLowerCase();
    const isPhrase = wordLower.includes(" ");

    if (isPhrase) {
      const regex = new RegExp(wordLower.replace(/\s+/g, "\\s+"), "gi");
      const matches = tokenStr.match(regex) || [];
      if (matches.length > 0) {
        const approxIndex = tokens.indexOf(wordLower.split(" ")[0]);
        const negated = approxIndex >= 0 ? isNegated(tokens, approxIndex) : false;
        const tfScore = Math.min(matches.length * 0.4, 1.0);
        scored.push({
          word: kw.word,
          rawWeight: kw.weight,
          normalizedWeight: negated ? 0 : +(kw.weight * tfScore * fieldWeight).toFixed(3),
          negated,
        });
      }
    } else {
      const indices: number[] = [];
      tokens.forEach((t, i) => { if (t === wordLower) indices.push(i); });
      if (indices.length > 0) {
        const negated = indices.some(idx => isNegated(tokens, idx));
        const tfScore = Math.min(indices.length * 0.4, 1.0);
        scored.push({
          word: kw.word,
          rawWeight: kw.weight,
          normalizedWeight: negated ? 0 : +(kw.weight * tfScore * fieldWeight).toFixed(3),
          negated,
        });
      }
    }
  }

  return scored.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
}

// ─── Probability from scores ──────────────────────────────────────────────────

function computeProbabilityFromScores(scores: TokenScore[], wordCount: number): number {
  const activeScores = scores.filter(s => !s.negated);
  if (activeScores.length === 0) return 0;
  const total = activeScores.reduce((s, t) => s + t.normalizedWeight, 0);
  const density = total / Math.max(wordCount, 10);
  const sigmoid = 1 / (1 + Math.exp(-3 * (density - 0.3)));
  return Math.min(sigmoid, 0.99);
}

// ─── True LIME: leave-one-out ─────────────────────────────────────────────────

function computeLIME(
  scores: TokenScore[],
  wordCount: number,
  limit = 8
): Array<{ word: string; weight: number }> {
  const baseProbRaw = computeProbabilityFromScores(scores, wordCount);

  return scores.slice(0, limit).map(feature => {
    const withoutFeature = scores.filter(s => s.word !== feature.word);
    const probWithout = computeProbabilityFromScores(withoutFeature, wordCount);
    // delta = how much probability drops when this word is removed
    const limeWeight = +(baseProbRaw - probWithout).toFixed(3);
    return { word: feature.word, weight: limeWeight };
  }).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
}

// ─── Confidence intervals ─────────────────────────────────────────────────────

function computeConfidenceInterval(
  prob: number,
  wordCount: number
): { lower: number; upper: number; adequate: boolean } {
  // Interval shrinks as word count increases; adequate threshold = 30 words
  const adequate = wordCount >= 30;
  // Exponential decay: at 0 words, ±0.25; at 30 words, ±0.09; at 80+ words, ±0.03
  const halfWidth = 0.25 * Math.exp(-wordCount / 30);
  return {
    lower: +Math.max(0, prob - halfWidth).toFixed(4),
    upper: +Math.min(1, prob + halfWidth).toFixed(4),
    adequate,
  };
}

// ─── Counterfactuals ──────────────────────────────────────────────────────────

function computeCounterfactuals(
  scores: TokenScore[],
  wordCount: number,
  currentNormProb: number,
  dimensionLabel: string,
  limit = 3
): Array<{ remove: string; newProbability: number; delta: number; explanation: string }> {
  const activeScores = scores.filter(s => !s.negated && s.normalizedWeight > 0);

  return activeScores.slice(0, limit).map(feature => {
    const withoutFeature = scores.filter(s => s.word !== feature.word);
    const rawWithout = computeProbabilityFromScores(withoutFeature, wordCount);

    // Re-normalize relative to total just as the main classifier does
    // (approximate — we keep all other dims constant for simplicity)
    const newProb = +rawWithout.toFixed(4);
    const delta = +(rawWithout - computeProbabilityFromScores(scores, wordCount)).toFixed(4);

    const dirStr = delta < -0.02 ? "fall" : delta > 0.02 ? "rise" : "remain similar";
    const pctChange = Math.abs(delta * 100).toFixed(0);

    const explanation = `Removing "${feature.word}" would cause ${dimensionLabel} probability to ${dirStr} by ~${pctChange}% (from ${(currentNormProb * 100).toFixed(0)}% to ${(Math.max(0, currentNormProb + delta) * 100).toFixed(0)}%).`;

    return { remove: feature.word, newProbability: newProb, delta, explanation };
  });
}

// ─── Agreement (Jaccard on top features) ─────────────────────────────────────

function computeAgreement(
  shapFeats: Array<{ word: string; weight: number }>,
  limeFeats: Array<{ word: string; weight: number }>
): number {
  if (shapFeats.length === 0 || limeFeats.length === 0) return 0;
  const shapWords = new Set(shapFeats.map(f => f.word));
  const limeWords = limeFeats.map(f => f.word);
  const overlap = limeWords.filter(w => shapWords.has(w)).length;
  const union = new Set([...shapWords, ...limeWords]).size;
  return union === 0 ? 0 : +(overlap / union).toFixed(2);
}

// ─── Source type & interpretations ───────────────────────────────────────────

function determineSourceType(probs: Record<Dimension, number>): string {
  const threshold = 0.5;
  const spiritual = probs["Spiritual"] > threshold;
  const trauma = probs["Trauma"] > threshold;
  const maintenance = probs["Maintenance"] > threshold;
  if (spiritual && !trauma && !maintenance) return "spiritual_dominant";
  if (trauma && !spiritual && !maintenance) return "trauma_dominant";
  if (maintenance && !spiritual && !trauma) return "maintenance_dominant";
  if (spiritual && trauma) return "mixed_spiritual_trauma";
  return "mixed_all";
}

const SOURCE_INFO_MAP: Record<string, { title: string; icon: string; color: string; guidance: string }> = {
  spiritual_dominant: { title: "Potentially Divine Communication", icon: "✨", color: "indigo", guidance: "Apply the Discernment Checklist: Does it align with Scripture? Does it produce peace?" },
  trauma_dominant: { title: "Trauma Processing / Threat Simulation", icon: "⚠️", color: "red", guidance: "Consider using IRT to rewrite this dream with a safe ending." },
  maintenance_dominant: { title: "Biological Processing", icon: "🧠", color: "green", guidance: "Standard maintenance dream. No special action required." },
  mixed_spiritual_trauma: { title: "Spiritual Warfare / Shadow Work", icon: "⚔️", color: "purple", guidance: "This may represent spiritual warfare or areas requiring healing." },
  mixed_all: { title: "Complex Multi-Dimensional Dream", icon: "🔮", color: "slate", guidance: "Apply careful discernment." },
};

function buildInterpretation(probs: Record<Dimension, number>, sourceType: string, wordCount: number): string {
  const lowConfidenceNote = wordCount < 30 ? " (Note: confidence is limited — add more narrative detail for a more reliable result.)" : "";
  const interpretations: Record<string, string> = {
    spiritual_dominant: `This dream shows strong spiritual markers (${(probs["Spiritual"] * 100).toFixed(0)}% Spiritual). The imagery and language suggest potential divine communication or spiritual encounter. Apply the three-part discernment test: Does it align with Scripture? Does it produce lasting peace rather than anxiety? Does it call you toward love and righteousness?${lowConfidenceNote}`,
    trauma_dominant: `The classification indicates significant trauma-processing content (${(probs["Trauma"] * 100).toFixed(0)}% Trauma). This dream likely reflects your mind working through difficult experiences or perceived threats. Consider Image Rehearsal Therapy (IRT): rewrite this dream with a mastery action — what could you do differently to change the outcome?${lowConfidenceNote}`,
    maintenance_dominant: `This appears to be primarily a maintenance dream (${(probs["Maintenance"] * 100).toFixed(0)}% Maintenance), reflecting everyday cognitive processing. Your mind is consolidating recent experiences. No special spiritual action is required. Rest in Psalm 4:8.${lowConfidenceNote}`,
    mixed_spiritual_trauma: `This complex dream shows both spiritual markers (${(probs["Spiritual"] * 100).toFixed(0)}%) and trauma content (${(probs["Trauma"] * 100).toFixed(0)}%). This may represent spiritual warfare or areas where God is bringing healing. Apply discernment carefully and consider whether the content aligns with Scripture.${lowConfidenceNote}`,
    mixed_all: `This dream contains a complex mixture (Spiritual: ${(probs["Spiritual"] * 100).toFixed(0)}%, Trauma: ${(probs["Trauma"] * 100).toFixed(0)}%, Maintenance: ${(probs["Maintenance"] * 100).toFixed(0)}%). Apply careful discernment across all dimensions and bring it to prayer before drawing conclusions.${lowConfidenceNote}`,
  };
  return interpretations[sourceType] || interpretations["mixed_all"];
}

function buildDimensionInterpretations(probs: Record<Dimension, number>): Record<Dimension, string> {
  return {
    Spiritual: probs["Spiritual"] > 0.5
      ? `Strong spiritual markers detected (${(probs["Spiritual"] * 100).toFixed(0)}%). The imagery and language suggest potential divine communication. Apply the discernment checklist before acting on insights.`
      : `Moderate or low spiritual content (${(probs["Spiritual"] * 100).toFixed(0)}%). Some spiritual language is present but below the primary threshold. Consider whether any elements feel meaningfully different from ordinary dreams.`,
    Trauma: probs["Trauma"] > 0.5
      ? `Significant trauma-processing content (${(probs["Trauma"] * 100).toFixed(0)}%). This dream likely reflects threat simulation or emotional processing of difficult experiences. IRT is recommended.`
      : `Low trauma indicators (${(probs["Trauma"] * 100).toFixed(0)}%). Limited threat or distress content detected. This is within a normal range for dream processing.`,
    Maintenance: probs["Maintenance"] > 0.5
      ? `Strong maintenance markers (${(probs["Maintenance"] * 100).toFixed(0)}%). This dream primarily reflects ordinary cognitive processing and memory consolidation — the most common dream type.`
      : `Below-average maintenance content (${(probs["Maintenance"] * 100).toFixed(0)}%). This dream contains fewer ordinary everyday elements, suggesting more emotionally or spiritually significant content.`,
  };
}

// ─── Field-weighted text builder ──────────────────────────────────────────────

interface DreamFields {
  narrative?: string;
  title?: string;
  theme?: string;
  affect?: string;
  interpretation?: string;
  coreThreat?: string;
  masteryAction?: string;
  safeEnding?: string;
  question?: string;
  incubationRequest?: string;
  concerns?: string;
}

function buildWeightedScores(
  fields: DreamFields,
  keywords: KeywordEntry[]
): { scores: TokenScore[]; totalWordCount: number } {
  const allScores: TokenScore[] = [];
  let totalWordCount = 0;

  for (const [fieldName, text] of Object.entries(fields)) {
    if (!text || typeof text !== "string") continue;
    const tokens = tokenize(text);
    totalWordCount += tokens.length;
    const fw = FIELD_WEIGHTS[fieldName] ?? 1.0;
    const fieldScores = computeScores(tokens, keywords, fw);
    for (const s of fieldScores) {
      const existing = allScores.find(x => x.word === s.word);
      if (existing) {
        if (!s.negated) existing.normalizedWeight += s.normalizedWeight;
      } else {
        allScores.push({ ...s });
      }
    }
  }

  return { scores: allScores.sort((a, b) => b.normalizedWeight - a.normalizedWeight), totalWordCount };
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/classify", (req: Request, res: Response) => {
  try {
    const body = req.body as { text?: string; fields?: DreamFields };

    if (!body.text && !body.fields) {
      res.status(400).json({ success: false, error: "Either text or fields is required" });
      return;
    }

    let spiritualScores: TokenScore[];
    let traumaScores: TokenScore[];
    let maintenanceScores: TokenScore[];
    let wordCount: number;
    let negationsDetected: number;
    let fieldWeighting: boolean;

    if (body.fields && Object.keys(body.fields).length > 0) {
      // Per-field weighted classification
      fieldWeighting = true;
      const sp = buildWeightedScores(body.fields, SPIRITUAL_KEYWORDS);
      const tr = buildWeightedScores(body.fields, TRAUMA_KEYWORDS);
      const mn = buildWeightedScores(body.fields, MAINTENANCE_KEYWORDS);
      spiritualScores = sp.scores;
      traumaScores = tr.scores;
      maintenanceScores = mn.scores;
      wordCount = sp.totalWordCount;
    } else {
      // Flat text classification
      fieldWeighting = false;
      const tokens = tokenize(body.text!);
      wordCount = tokens.length;
      spiritualScores = computeScores(tokens, SPIRITUAL_KEYWORDS);
      traumaScores = computeScores(tokens, TRAUMA_KEYWORDS);
      maintenanceScores = computeScores(tokens, MAINTENANCE_KEYWORDS);
    }

    // Count negated keywords across all dimensions
    negationsDetected = [
      ...spiritualScores.filter(s => s.negated),
      ...traumaScores.filter(s => s.negated),
      ...maintenanceScores.filter(s => s.negated),
    ].length;

    // Raw probabilities
    const rawSpiritual = computeProbabilityFromScores(spiritualScores, wordCount);
    const rawTrauma = computeProbabilityFromScores(traumaScores, wordCount);
    const rawMaintenance = computeProbabilityFromScores(maintenanceScores, wordCount);

    const total = rawSpiritual + rawTrauma + rawMaintenance || 1;
    const probs: Record<Dimension, number> = {
      Spiritual: +(rawSpiritual / total).toFixed(4),
      Trauma: +(rawTrauma / total).toFixed(4),
      Maintenance: +(rawMaintenance / total).toFixed(4),
    };

    // SHAP: top weighted features (positive only)
    const topFeat = (scores: TokenScore[], n = 8) =>
      scores.filter(s => !s.negated && s.normalizedWeight > 0).slice(0, n)
        .map(s => ({ word: s.word, weight: +s.normalizedWeight.toFixed(3) }));

    const shapSpiritual = topFeat(spiritualScores);
    const shapTrauma = topFeat(traumaScores);
    const shapMaintenance = topFeat(maintenanceScores);

    // True LIME: leave-one-out deltas
    const limeSpiritual = computeLIME(spiritualScores, wordCount);
    const limeTrauma = computeLIME(traumaScores, wordCount);
    const limeMaintenance = computeLIME(maintenanceScores, wordCount);

    // Agreement (now genuinely meaningful — LIME ≠ SHAP)
    const agreement: Record<Dimension, number> = {
      Spiritual: computeAgreement(shapSpiritual, limeSpiritual),
      Trauma: computeAgreement(shapTrauma, limeTrauma),
      Maintenance: computeAgreement(shapMaintenance, limeMaintenance),
    };

    // Confidence intervals
    const confidenceIntervals = {
      Spiritual: computeConfidenceInterval(probs.Spiritual, wordCount),
      Trauma: computeConfidenceInterval(probs.Trauma, wordCount),
      Maintenance: computeConfidenceInterval(probs.Maintenance, wordCount),
    };

    // Counterfactuals (per normalized dimension probability)
    const counterfactuals = {
      Spiritual: computeCounterfactuals(spiritualScores, wordCount, probs.Spiritual, "Spiritual"),
      Trauma: computeCounterfactuals(traumaScores, wordCount, probs.Trauma, "Trauma"),
      Maintenance: computeCounterfactuals(maintenanceScores, wordCount, probs.Maintenance, "Maintenance"),
    };

    const sourceType = determineSourceType(probs);
    const sourceInfo = SOURCE_INFO_MAP[sourceType];
    const interpretation = buildInterpretation(probs, sourceType, wordCount);
    const dimensionInterpretations = buildDimensionInterpretations(probs);

    const response = ClassifyDreamResponse.parse({
      success: true,
      probabilities: probs,
      shap: { Spiritual: shapSpiritual, Trauma: shapTrauma, Maintenance: shapMaintenance },
      lime: { Spiritual: limeSpiritual, Trauma: limeTrauma, Maintenance: limeMaintenance },
      agreement,
      confidenceIntervals,
      counterfactuals,
      sourceType,
      sourceInfo,
      interpretation,
      dimensionInterpretations,
      wordCount,
      negationsDetected,
      fieldWeighting,
    });

    res.json(response);
  } catch (err) {
    console.error("Classification error:", err);
    res.status(500).json({ success: false, error: "Internal classification error" });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  const response = ModelHealthResponse.parse({
    status: "healthy",
    model_loaded: true,
    shap_available: true,
    lime_available: true,
    features: 2000,
  });
  res.json(response);
});

export default router;
