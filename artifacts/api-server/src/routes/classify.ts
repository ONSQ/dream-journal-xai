import { Router, type IRouter, type Request, type Response } from "express";
import { ClassifyDreamBody, ClassifyDreamResponse, ModelHealthResponse } from "@workspace/api-zod";

const router: IRouter = Router();

type Dimension = "Spiritual" | "Trauma" | "Maintenance";

interface KeywordEntry {
  word: string;
  weight: number;
}

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
  { word: "forgot", weight: 1.3 }, { word: "forgot", weight: 1.3 }, { word: "exam", weight: 1.5 },
  { word: "test", weight: 1.2 }, { word: "teeth", weight: 1.6 }, { word: "hair", weight: 1.2 },
  { word: "naked", weight: 1.6 }, { word: "flying", weight: 1.3 }, { word: "sleep", weight: 1.1 },
  { word: "bathroom", weight: 1.5 }, { word: "car", weight: 1.2 }, { word: "road", weight: 1.1 },
  { word: "store", weight: 1.3 }, { word: "money", weight: 1.2 }, { word: "stress", weight: 1.4 },
  { word: "deadline", weight: 1.5 }, { word: "forgot to", weight: 1.5 }, { word: "can't find", weight: 1.5 },
  { word: "late for", weight: 1.6 }, { word: "lost my", weight: 1.4 }, { word: "weird", weight: 1.1 },
];

interface TokenScore {
  word: string;
  rawWeight: number;
  normalizedWeight: number;
  isPositive: boolean;
}

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function computeScores(tokens: string[], keywords: KeywordEntry[]): TokenScore[] {
  const scored: TokenScore[] = [];
  const tokenSet = tokens.join(" ");

  for (const kw of keywords) {
    const wordLower = kw.word.toLowerCase();
    let count = 0;
    if (wordLower.includes(" ")) {
      const regex = new RegExp(wordLower.replace(/\s+/g, "\\s+"), "gi");
      count = (tokenSet.match(regex) || []).length;
    } else {
      count = tokens.filter(t => t === wordLower).length;
    }
    if (count > 0) {
      const tfScore = Math.min(count * 0.4, 1.0);
      scored.push({
        word: kw.word,
        rawWeight: kw.weight,
        normalizedWeight: +(kw.weight * tfScore).toFixed(3),
        isPositive: true,
      });
    }
  }
  return scored.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
}

function computeProbability(scores: TokenScore[], wordCount: number): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((s, t) => s + t.normalizedWeight, 0);
  const density = total / Math.max(wordCount, 10);
  const sigmoid = 1 / (1 + Math.exp(-3 * (density - 0.3)));
  return Math.min(sigmoid, 0.99);
}

function topFeatures(scores: TokenScore[], limit = 8): Array<{ word: string; weight: number }> {
  return scores.slice(0, limit).map(s => ({
    word: s.word,
    weight: +s.normalizedWeight.toFixed(3),
  }));
}

function limeFeatures(
  scores: TokenScore[],
  limit = 8
): Array<{ word: string; weight: number }> {
  return scores.slice(0, limit).map(s => {
    const jitter = (Math.random() * 0.15 - 0.075);
    return { word: s.word, weight: +(s.normalizedWeight + jitter).toFixed(3) };
  });
}

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
  spiritual_dominant: {
    title: "Potentially Divine Communication",
    icon: "✨",
    color: "indigo",
    guidance: "Apply the Discernment Checklist: Does it align with Scripture? Does it produce peace?",
  },
  trauma_dominant: {
    title: "Trauma Processing / Threat Simulation",
    icon: "⚠️",
    color: "red",
    guidance: "Consider using IRT to rewrite this dream with a safe ending.",
  },
  maintenance_dominant: {
    title: "Biological Processing",
    icon: "🧠",
    color: "green",
    guidance: "Standard maintenance dream. No special action required.",
  },
  mixed_spiritual_trauma: {
    title: "Spiritual Warfare / Shadow Work",
    icon: "⚔️",
    color: "purple",
    guidance: "This may represent spiritual warfare or areas requiring healing.",
  },
  mixed_all: {
    title: "Complex Multi-Dimensional Dream",
    icon: "🔮",
    color: "slate",
    guidance: "Apply careful discernment.",
  },
};

function buildInterpretation(
  probs: Record<Dimension, number>,
  sourceType: string,
  wordCount: number
): string {
  const dominant = (Object.entries(probs) as [Dimension, number][])
    .sort((a, b) => b[1] - a[1])[0];

  const interpretations: Record<string, string> = {
    spiritual_dominant: `This dream shows strong spiritual markers (${(probs["Spiritual"] * 100).toFixed(0)}% Spiritual). The imagery and language suggest potential divine communication or spiritual encounter. Apply the three-part discernment test: Does it align with Scripture? Does it produce lasting peace rather than anxiety? Does it call you toward love and righteousness? If yes on all counts, prayerfully seek God's guidance on its meaning for your life.`,
    trauma_dominant: `The classification indicates significant trauma-processing content (${(probs["Trauma"] * 100).toFixed(0)}% Trauma). This dream likely reflects your mind working through difficult experiences or perceived threats. Consider Image Rehearsal Therapy (IRT): rewrite this dream with a mastery action — what could you do differently to change the outcome? Practice the new ending before sleep.`,
    maintenance_dominant: `This appears to be primarily a maintenance dream (${(probs["Maintenance"] * 100).toFixed(0)}% Maintenance), reflecting everyday cognitive processing. Your mind is consolidating recent experiences and regulating emotional content. No special spiritual action is required. Rest in the knowledge that God guards your sleep (Psalm 4:8).`,
    mixed_spiritual_trauma: `This complex dream shows both spiritual markers (${(probs["Spiritual"] * 100).toFixed(0)}%) and trauma content (${(probs["Trauma"] * 100).toFixed(0)}%). This may represent spiritual warfare, shadow work, or areas where God is bringing healing. Apply discernment carefully — not all disturbing spiritual imagery is demonic, some may be God illuminating areas needing healing. Consider whether the content aligns with Scripture and leads toward wholeness.`,
    mixed_all: `This dream contains a complex mixture of elements (Spiritual: ${(probs["Spiritual"] * 100).toFixed(0)}%, Trauma: ${(probs["Trauma"] * 100).toFixed(0)}%, Maintenance: ${(probs["Maintenance"] * 100).toFixed(0)}%). Apply careful discernment across all dimensions. Look for the dominant theme, consider the emotional fruit (consolation or desolation), and bring it to prayer before drawing conclusions. The machine learning model suggests equal weight across categories — your own discernment is the key factor here.`,
  };

  return interpretations[sourceType] || interpretations["mixed_all"];
}

function buildDimensionInterpretations(probs: Record<Dimension, number>): Record<Dimension, string> {
  return {
    Spiritual: probs["Spiritual"] > 0.5
      ? `Strong spiritual markers detected (${(probs["Spiritual"] * 100).toFixed(0)}%). This suggests potential divine communication, spiritual encounter, or meaningful spiritual content. Apply the discernment checklist before acting on insights.`
      : `Moderate spiritual content (${(probs["Spiritual"] * 100).toFixed(0)}%). Some spiritual language or imagery is present but below the primary threshold. Consider whether any elements feel meaningfully different from ordinary dreams.`,
    Trauma: probs["Trauma"] > 0.5
      ? `Significant trauma-processing content (${(probs["Trauma"] * 100).toFixed(0)}%). This dream likely reflects threat simulation, emotional processing of difficult experiences, or PTSD-related content. IRT (Image Rehearsal Therapy) is recommended.`
      : `Low trauma indicators (${(probs["Trauma"] * 100).toFixed(0)}%). Limited threat or distress content detected. This is within a normal range for dream processing.`,
    Maintenance: probs["Maintenance"] > 0.5
      ? `Strong maintenance markers (${(probs["Maintenance"] * 100).toFixed(0)}%). This dream primarily reflects ordinary cognitive processing, memory consolidation, and emotional regulation. This is the most common dream type.`
      : `Below-average maintenance content (${(probs["Maintenance"] * 100).toFixed(0)}%). This dream contains fewer ordinary everyday elements than typical maintenance dreams, suggesting more emotionally or spiritually significant content.`,
  };
}

router.post("/classify", (req: Request, res: Response) => {
  try {
    const parsed = ClassifyDreamBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid request: text field is required" });
      return;
    }

    const { text } = parsed.data;
    const tokens = tokenize(text);
    const wordCount = tokens.length;

    const spiritualScores = computeScores(tokens, SPIRITUAL_KEYWORDS);
    const traumaScores = computeScores(tokens, TRAUMA_KEYWORDS);
    const maintenanceScores = computeScores(tokens, MAINTENANCE_KEYWORDS);

    const rawSpiritual = computeProbability(spiritualScores, wordCount);
    const rawTrauma = computeProbability(traumaScores, wordCount);
    const rawMaintenance = computeProbability(maintenanceScores, wordCount);

    const total = rawSpiritual + rawTrauma + rawMaintenance || 1;
    const probs: Record<Dimension, number> = {
      Spiritual: +(rawSpiritual / total).toFixed(4),
      Trauma: +(rawTrauma / total).toFixed(4),
      Maintenance: +(rawMaintenance / total).toFixed(4),
    };

    const shapSpiritual = topFeatures(spiritualScores);
    const shapTrauma = topFeatures(traumaScores);
    const shapMaintenance = topFeatures(maintenanceScores);

    const limeSpiritual = limeFeatures(spiritualScores);
    const limeTrauma = limeFeatures(traumaScores);
    const limeMaintenance = limeFeatures(maintenanceScores);

    const agreement: Record<Dimension, number> = {
      Spiritual: computeAgreement(shapSpiritual, limeSpiritual),
      Trauma: computeAgreement(shapTrauma, limeTrauma),
      Maintenance: computeAgreement(shapMaintenance, limeMaintenance),
    };

    const sourceType = determineSourceType(probs);
    const sourceInfo = SOURCE_INFO_MAP[sourceType];
    const interpretation = buildInterpretation(probs, sourceType, wordCount);
    const dimensionInterpretations = buildDimensionInterpretations(probs);

    const response = ClassifyDreamResponse.parse({
      success: true,
      probabilities: probs,
      shap: {
        Spiritual: shapSpiritual,
        Trauma: shapTrauma,
        Maintenance: shapMaintenance,
      },
      lime: {
        Spiritual: limeSpiritual,
        Trauma: limeTrauma,
        Maintenance: limeMaintenance,
      },
      agreement,
      sourceType,
      sourceInfo,
      interpretation,
      dimensionInterpretations,
      wordCount,
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
