import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, BookOpen, Shield, Brain, Heart, ChevronRight, 
  ChevronDown, Sparkles, AlertTriangle, Check, X, Plus, Zap, Loader2,
  Copy, RefreshCw, TrendingUp, Download, Eye, ChevronLeft, Wind, Mic, ExternalLink
} from 'lucide-react';
import { useClassifyDream, useModelHealth } from "@workspace/api-client-react";
import { useJournalEntries, type JournalEntry, type JournalMode } from '@/hooks/use-journal';
import type { ClassifyResponse } from "@workspace/api-client-react/src/generated/api.schemas";

// --- Constants ---
const SCRIPTURES = {
  protection: [
    { text: "In peace I will both lie down and sleep; for you alone, O Lord, make me dwell in safety.", ref: "Psalm 4:8" },
    { text: "I will not fear the terror of the night.", ref: "Psalm 91:5" },
    { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1" },
    { text: "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty.", ref: "Psalm 91:1" },
    { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
  ],
  fear: [
    { text: "For God gave us a spirit not of fear but of power and love and self-control.", ref: "2 Timothy 1:7" },
    { text: "When I am afraid, I put my trust in you.", ref: "Psalm 56:3" },
    { text: "Have I not commanded you? Be strong and courageous. Do not be frightened.", ref: "Joshua 1:9" },
  ],
  dreams: [
    { text: "For God does speak—now one way, now another—though no one perceives it. In a dream, in a vision of the night...", ref: "Job 33:14-15" },
    { text: "In the last days, God says, I will pour out my Spirit on all people. Your sons and daughters will prophesy, your young men will see visions, your old men will dream dreams.", ref: "Acts 2:17" },
    { text: "When you lie down, you will not be afraid; when you lie down, your sleep will be sweet.", ref: "Proverbs 3:24" },
    { text: "I will bless the Lord who gives me counsel; in the night also my heart instructs me.", ref: "Psalm 16:7" },
  ]
};

const SOURCE_INTERPRETATIONS: Record<string, any> = {
  spiritual_dominant: { title: "Potentially Divine Communication", icon: "✨", color: "indigo", guidance: "Apply the Discernment Checklist: Does it align with Scripture? Does it produce peace?" },
  trauma_dominant: { title: "Trauma Processing / Threat Simulation", icon: "⚠️", color: "red", guidance: "Consider using IRT to rewrite this dream with a safe ending." },
  maintenance_dominant: { title: "Biological Processing", icon: "🧠", color: "green", guidance: "Standard maintenance dream. No special action required." },
  mixed_spiritual_trauma: { title: "Spiritual Warfare / Shadow Work", icon: "⚔️", color: "purple", guidance: "This may represent spiritual warfare or areas requiring healing." },
  mixed_all: { title: "Complex Multi-Dimensional Dream", icon: "🔮", color: "slate", guidance: "Apply careful discernment." }
};

const PROTOCOL_3AM = {
  title: "3 AM Protocol",
  steps: [
    { label: "Ground: 5 Things You See", desc: "Name 5 objects in the room you can see right now. Say them aloud." },
    { label: "Ground: 4 Things You Touch", desc: "Feel the bed, pillow, blanket, floor. Notice the physical sensation." },
    { label: "Ground: 3 Sounds You Hear", desc: "Listen for ambient sounds — the hum of a fan, air, or silence itself." },
    { label: "Ground: 2 Things You Smell", desc: "Focus on two scents, however faint. Fresh air, your pillow, a candle." },
    { label: "Ground: 1 Deep Breath", desc: "Breathe in for 4 counts, hold for 4, exhale for 6. Repeat twice." },
  ],
  scripture: { text: "In peace I will both lie down and sleep; for you alone, O Lord, make me dwell in safety.", ref: "Psalm 4:8" },
  prayer: "Lord, I am safe. You are with me. No weapon formed against me shall prosper. I receive Your peace now. In Jesus' name, Amen.",
};

// --- Helpers ---
function getDailyScripture<T>(arr: T[]): T {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % arr.length;
  return arr[dayIndex];
}

function wordCount(text: string): number {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function collectAllEntryText(data: Record<string, any>): string {
  const fields = [
    data.title, data.narrative, data.incubationRequest, data.theme,
    data.affect, data.question, data.interpretation, data.coreThreat,
    data.dominantEmotion, data.dreamSign, data.masteryAction,
    data.safeEnding, data.interventionPoint, data.recognitionStatement, data.concerns
  ];
  return fields.filter(Boolean).join(' ');
}

function collectEntryFields(data: Record<string, any>): Record<string, string> {
  const mapping: Record<string, string> = {
    narrative: data.narrative,
    title: data.title,
    theme: data.theme,
    affect: data.affect,
    interpretation: data.interpretation,
    coreThreat: data.coreThreat,
    masteryAction: data.masteryAction,
    safeEnding: data.safeEnding,
    question: data.question,
    incubationRequest: data.incubationRequest,
    concerns: data.concerns,
  };
  return Object.fromEntries(Object.entries(mapping).filter(([, v]) => v && typeof v === 'string' && v.trim().length > 0));
}

function formatEntryForExport(entry: JournalEntry): string {
  const d = entry.data;
  const date = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const mode = entry.mode === 'vigilant' ? 'Vigilant Spirit (Dream)' : 'The Restored Night (Healing)';
  const lines: string[] = [
    `VIGILANT SPIRIT DREAM JOURNAL`,
    `================================`,
    `Date: ${date}`,
    `Mode: ${mode}`,
    `Phase Reached: ${entry.phase}`,
    ``,
  ];
  if (d.title) lines.push(`Title: ${d.title}`, ``);
  if (d.narrative) lines.push(`Narrative:`, d.narrative, ``);
  if (d.incubationRequest) lines.push(`Incubation Request:`, d.incubationRequest, ``);
  if (d.theme) lines.push(`Theme: ${d.theme}`);
  if (d.affect) lines.push(`Affect: ${d.affect}`);
  if (d.question) lines.push(`Question: ${d.question}`);
  if (d.interpretation) lines.push(``, `Interpretation:`, d.interpretation, ``);
  if (d.coreThreat) lines.push(`Core Threat: ${d.coreThreat}`);
  if (d.masteryAction) lines.push(`Mastery Action:`, d.masteryAction, ``);
  if (d.safeEnding) lines.push(`Safe Ending:`, d.safeEnding, ``);
  if (d.spiritualDeclaration) lines.push(`Spiritual Declaration:`, d.spiritualDeclaration, ``);
  if (d._classification) {
    const c = d._classification;
    lines.push(`XAI Classification:`);
    lines.push(`  Spiritual: ${(c.probabilities.Spiritual * 100).toFixed(1)}%`);
    lines.push(`  Trauma: ${(c.probabilities.Trauma * 100).toFixed(1)}%`);
    lines.push(`  Maintenance: ${(c.probabilities.Maintenance * 100).toFixed(1)}%`);
    lines.push(``);
  }
  lines.push(`================================`);
  lines.push(`Exported from Vigilant Spirit Dream Journal`);
  return lines.join('\n');
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// --- Trends Helpers ---
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Components ---
function WordCountHint({ text, target = 30 }: { text: string; target?: number }) {
  const count = wordCount(text);
  const met = count >= target;
  return (
    <div className={`flex justify-end mt-1.5 text-xs font-medium transition-colors ${met ? 'text-emerald-400' : 'text-slate-500'}`}>
      {met ? (
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Good detail ({count} words)</span>
      ) : (
        <span>{count} / {target} words for best analysis</span>
      )}
    </div>
  );
}

// ─── Speech-to-text ──────────────────────────────────────────────────────────

// Module-level exclusive recording tracker: only one mic active at a time
const _speechTracker: { stop: (() => void) | null } = { stop: null };

function SpeechButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<any>(null);
  const valueRef = useRef(value);
  const committedIndexRef = useRef(0);
  useEffect(() => { valueRef.current = value; }, [value]);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterim('');
  }, []);

  useEffect(() => () => { recognitionRef.current?.abort?.(); }, []);

  if (!isSupported) return null;

  const startRecording = () => {
    _speechTracker.stop?.();
    _speechTracker.stop = stopRecording;
    committedIndexRef.current = 0;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      // Use max of event.resultIndex and our own committed index to guard against
      // browsers (e.g. Chrome mobile) that always report resultIndex = 0, which
      // would cause already-committed results to be appended again.
      const startIndex = Math.max(event.resultIndex, committedIndexRef.current);
      for (let i = startIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t;
          committedIndexRef.current = i + 1;
        } else {
          interimText += t;
        }
      }
      if (finalText) {
        const cur = valueRef.current;
        onChange((cur ? cur.trimEnd() + ' ' : '') + finalText.trim());
        setInterim('');
      } else {
        setInterim(interimText);
      }
    };

    recognition.onerror = () => { setIsRecording(false); setInterim(''); _speechTracker.stop = null; };
    recognition.onend = () => { setIsRecording(false); setInterim(''); _speechTracker.stop = null; };

    recognition.start();
    setIsRecording(true);
  };

  const toggle = () => { if (isRecording) stopRecording(); else startRecording(); };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        title={isRecording ? 'Tap to stop recording' : 'Tap to dictate (Chrome / Edge)'}
        aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
          isRecording
            ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-lg shadow-red-900/30'
            : 'bg-slate-800/70 border-white/5 text-slate-500 hover:text-slate-200 hover:bg-slate-700'
        }`}
      >
        {isRecording ? (
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
      </button>
      {isRecording && interim && (
        <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 max-w-[240px] shadow-xl z-20 pointer-events-none whitespace-pre-wrap">
          <span className="text-red-400 mr-1.5 text-[10px] font-semibold uppercase tracking-wide">Live</span>
          <span className="italic opacity-80">{interim}</span>
        </div>
      )}
    </div>
  );
}

function ClearboxAnalysis({ classification, entryData, isLoading, error, onReclassify }: { 
  classification: ClassifyResponse | null; 
  entryData: any; 
  mode: JournalMode; 
  isLoading: boolean; 
  error: string | null;
  onReclassify?: () => void;
}) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Analyzing dream dimensions...</p>
        <p className="text-slate-500 text-sm mt-2">Running XAI classification with field weighting</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/20 border border-destructive/50 rounded-2xl p-6 shadow-lg shadow-destructive/5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive-foreground mb-2">Analysis Failed</h3>
            <p className="text-slate-300 text-sm mb-4">{error}</p>
            {onReclassify && (
              <button onClick={onReclassify}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
                <RefreshCw className="w-4 h-4" /> Retry Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (!classification) return null;
  
  const sourceInfo = classification.sourceInfo || SOURCE_INTERPRETATIONS[classification.sourceType] || SOURCE_INTERPRETATIONS.mixed_all;
  const wc = classification.wordCount ?? 0;
  const lowConfidence = wc < 30;
  const negations = (classification as any).negationsDetected ?? 0;
  const fieldWeighted = (classification as any).fieldWeighting ?? false;
  const cis = (classification as any).confidenceIntervals as Record<string, { lower: number; upper: number; adequate: boolean }> | undefined;
  const counterfactuals = (classification as any).counterfactuals as Record<string, Array<{ remove: string; newProbability: number; delta: number; explanation: string }>> | undefined;

  const dimensions = [
    { key: 'Spiritual', color: 'indigo', gradient: 'from-indigo-600 to-primary' },
    { key: 'Trauma', color: 'red', gradient: 'from-destructive to-orange-500' },
    { key: 'Maintenance', color: 'green', gradient: 'from-emerald-600 to-teal-400' }
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Low-confidence warning */}
      {lowConfidence && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl px-4 py-3 flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 text-sm font-medium">Low word count — confidence is limited</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              Only {wc} words analyzed. Add more narrative detail (30+ words) to narrow the confidence intervals.
            </p>
          </div>
        </div>
      )}

      {/* XAI status banner */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-emerald-900/20 flex-1 min-w-0">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-emerald-200 text-sm font-medium">XAI Classification Complete</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-emerald-400/70 text-xs">SHAP + true LIME</span>
              {fieldWeighted && (
                <span className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  Field-weighted
                </span>
              )}
              {negations > 0 && (
                <span className="bg-orange-900/50 border border-orange-500/30 text-orange-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  {negations} negation{negations > 1 ? 's' : ''} neutralized
                </span>
              )}
              <span className="text-slate-600 text-[10px]">{wc} words</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {onReclassify && (
            <button onClick={onReclassify}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm flex items-center gap-2 transition-colors border border-white/5 min-h-[44px]">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Re-analyze</span>
            </button>
          )}
          <button 
            onClick={async () => { 
              const ok = await copyToClipboard(JSON.stringify(classification, null, 2));
              if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
            }}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm flex items-center gap-2 transition-colors border border-white/5 min-h-[44px]">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Source card */}
      <div className={`bg-slate-800/40 border border-white/10 rounded-2xl p-6 shadow-xl`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl drop-shadow-md">{sourceInfo.icon}</div>
          <div>
            <h3 className="text-xl font-display text-white mb-2">{sourceInfo.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{sourceInfo.guidance}</p>
          </div>
        </div>
      </div>

      {/* Dimensional breakdown with CIs and counterfactuals */}
      <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
        <h4 className="font-display text-lg mb-1 flex items-center gap-2 text-white">
          <Eye className="w-5 h-5 text-primary" />
          Dimensional Breakdown
        </h4>
        <p className="text-slate-500 text-xs mb-5">Tap a dimension to see XAI evidence, LIME deltas, and counterfactuals</p>
        <div className="space-y-5">
          {dimensions.map(dim => {
            const probKey = dim.key as keyof typeof classification.probabilities;
            const prob = classification.probabilities[probKey] || 0;
            const isExpanded = expandedDim === dim.key;
            const ci = cis?.[dim.key];
            const cfs = counterfactuals?.[dim.key] ?? [];
            const shapFeats = classification.shap[probKey] ?? [];
            const limeFeats = classification.lime[probKey] ?? [];
            const agr = classification.agreement[probKey as keyof typeof classification.agreement] ?? 0;
            
            return (
              <div key={dim.key} className="space-y-1.5">
                <button 
                  onClick={() => setExpandedDim(isExpanded ? null : dim.key)} 
                  className="w-full group min-h-[44px]"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-slate-200 flex items-center gap-2 group-hover:text-white transition-colors">
                      {dim.key}
                      {prob > 0.5 && <Check className="w-4 h-4 text-emerald-400" />}
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                    <div className="flex items-center gap-2">
                      {ci && (
                        <span className="font-mono text-[10px] text-slate-500">
                          [{(ci.lower * 100).toFixed(0)}–{(ci.upper * 100).toFixed(0)}%]
                        </span>
                      )}
                      <span className={`font-mono font-semibold ${prob > 0.5 ? 'text-white' : 'text-slate-500'}`}>
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Bar with confidence interval band */}
                  <div className="relative h-3 bg-slate-800 rounded-full shadow-inner overflow-visible">
                    {/* CI band (shown behind bar) */}
                    {ci && (
                      <div
                        className="absolute top-0 h-full rounded-full bg-white/10"
                        style={{ left: `${ci.lower * 100}%`, width: `${Math.max(0, (ci.upper - ci.lower)) * 100}%` }}
                      />
                    )}
                    {/* Main bar */}
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${dim.gradient} transition-all duration-1000 ease-out`}
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-5 bg-slate-800/50 rounded-xl border border-white/5 space-y-5">

                        {/* Dimension narrative */}
                        {classification.dimensionInterpretations && (
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {classification.dimensionInterpretations[dim.key as keyof typeof classification.dimensionInterpretations]}
                          </p>
                        )}

                        {/* Confidence interval explainer */}
                        {ci && (
                          <div className="bg-slate-900/60 rounded-lg p-3 border border-white/5">
                            <p className="text-xs font-semibold text-slate-400 mb-1">Confidence Interval</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Based on {wc} words, the true {dim.key} probability lies between{' '}
                              <span className="text-white font-medium">{(ci.lower * 100).toFixed(0)}%</span> and{' '}
                              <span className="text-white font-medium">{(ci.upper * 100).toFixed(0)}%</span>.{' '}
                              {ci.adequate
                                ? 'Word count is sufficient for reliable classification.'
                                : 'Add more detail to narrow this range.'}
                            </p>
                          </div>
                        )}
                        
                        {/* SHAP + LIME side by side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                              <Zap className="w-3 h-3" /> SHAP — Feature Weights
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {shapFeats.map((f, i) => (
                                <span key={i} className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-md text-xs text-emerald-100">
                                  "{f.word}" <span className="opacity-60">+{f.weight.toFixed(2)}</span>
                                </span>
                              ))}
                              {shapFeats.length === 0 && (
                                <span className="text-xs text-slate-500">None detected</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                              <Brain className="w-3 h-3" /> LIME — Leave-One-Out Δ
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {limeFeats.map((f, i) => (
                                <span key={i} className={`px-2 py-1 rounded-md text-xs border ${f.weight >= 0 ? 'bg-amber-950/40 border-amber-500/30 text-amber-100' : 'bg-slate-900/60 border-slate-600/30 text-slate-400'}`}>
                                  "{f.word}" <span className="opacity-70">{f.weight >= 0 ? '+' : ''}{f.weight.toFixed(3)}</span>
                                </span>
                              ))}
                              {limeFeats.length === 0 && (
                                <span className="text-xs text-slate-500">None detected</span>
                              )}
                            </div>
                            {shapFeats.length > 0 && limeFeats.length > 0 && (
                              <p className="text-[10px] text-slate-600 mt-1.5">
                                SHAP/LIME agreement: {(agr * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Counterfactuals */}
                        {cfs.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                              <RefreshCw className="w-3 h-3" /> Counterfactuals — "What if?"
                            </h5>
                            <div className="space-y-2">
                              {cfs.map((cf, i) => (
                                <div key={i} className="bg-blue-950/20 border border-blue-500/20 rounded-lg px-3 py-2.5">
                                  <p className="text-xs text-blue-100 leading-relaxed">{cf.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synthesis interpretation */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-6 border border-white/10 shadow-xl">
        <h4 className="font-display text-lg mb-3 flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Synthesis Interpretation
        </h4>
        <p className="text-slate-300 leading-relaxed text-sm">
          {classification.interpretation}
        </p>
      </div>
    </div>
  );
}

// --- 3 AM Protocol Modal ---
function Protocol3AMModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setBreathCount(prev => {
        if (prev <= 1) {
          setBreathPhase(p => {
            const next = p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale';
            return next;
          });
          return breathPhase === 'exhale' ? 4 : breathPhase === 'hold' ? 6 : 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-slate-950/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-white">3 AM Protocol</h2>
            <p className="text-xs text-slate-400">Emergency Grounding</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-lg mx-auto w-full px-5 py-8 space-y-6 pb-20">
        {/* Scripture */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5">
          <p className="text-lg text-slate-200 font-serif italic mb-2">"{PROTOCOL_3AM.scripture.text}"</p>
          <p className="text-slate-500 text-sm">— {PROTOCOL_3AM.scripture.ref}</p>
        </div>

        {/* Breathing exercise */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 text-center">
          <h3 className="font-display font-medium text-white mb-6 flex items-center justify-center gap-2">
            <Wind className="w-5 h-5 text-teal-400" />
            4-4-6 Breathing
          </h3>
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center text-4xl font-display font-bold text-white mx-auto transition-all duration-1000 ease-in-out shadow-[0_0_40px_rgba(0,0,0,0.3)]
            ${breathPhase === 'inhale' ? 'bg-blue-500/40 scale-125 border border-blue-400/50' : 
              breathPhase === 'hold' ? 'bg-purple-500/40 scale-100 border border-purple-400/50' : 
              'bg-teal-500/40 scale-75 border border-teal-400/50'}`}>
            {breathCount}
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          <p className="mt-6 text-base font-medium tracking-wider uppercase text-slate-300">{breathPhase}</p>
          <button onClick={() => {
            if (!breathingActive) { setBreathPhase('inhale'); setBreathCount(4); }
            setBreathingActive(!breathingActive);
          }}
            className={`mt-5 px-8 py-3 rounded-xl font-medium transition-all min-h-[48px] ${breathingActive ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-teal-700 text-white hover:bg-teal-600'}`}>
            {breathingActive ? 'Stop' : 'Begin Breathing'}
          </button>
        </div>

        {/* 5-4-3-2-1 Grounding */}
        <div className="space-y-3">
          <h3 className="font-display font-medium text-white text-lg">5-4-3-2-1 Grounding</h3>
          {PROTOCOL_3AM.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i === step ? -1 : i)}
              className={`w-full text-left rounded-xl border p-4 transition-all min-h-[56px] ${step === i ? 'bg-red-950/30 border-red-800/60' : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${step === i ? 'bg-red-800/60 text-red-200' : 'bg-slate-800 text-slate-400'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${step === i ? 'text-red-200' : 'text-slate-300'}`}>{s.label}</p>
                  {step === i && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${step === i ? 'rotate-180' : ''}`} />
              </div>
            </button>
          ))}
        </div>

        {/* Prayer */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 rounded-2xl p-6 border border-indigo-500/20">
          <h3 className="font-display font-medium text-indigo-200 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 opacity-80" /> Declaration of Safety
          </h3>
          <p className="text-sm text-indigo-100/80 italic leading-relaxed">{PROTOCOL_3AM.prayer}</p>
        </div>

        <button onClick={onClose}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium transition-colors min-h-[52px]">
          I Am Grounded. Close Protocol.
        </button>
      </div>
    </motion.div>
  );
}

// --- Trends View ---
function TrendsView({ entries, onBack }: { entries: JournalEntry[]; onBack: () => void }) {
  const last8Weeks: { label: string; count: number; vigilant: number; restored: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const key = getWeekKey(d);
    const weekEntries = entries.filter(e => getWeekKey(new Date(e.date)) === key);
    last8Weeks.push({
      label: key,
      count: weekEntries.length,
      vigilant: weekEntries.filter(e => e.mode === 'vigilant').length,
      restored: weekEntries.filter(e => e.mode === 'restored').length,
    });
  }

  const classifiedEntries = entries.filter(e => e.data._classification);
  const avgSpiritual = classifiedEntries.length
    ? classifiedEntries.reduce((s, e) => s + (e.data._classification.probabilities.Spiritual || 0), 0) / classifiedEntries.length
    : 0;
  const avgTrauma = classifiedEntries.length
    ? classifiedEntries.reduce((s, e) => s + (e.data._classification.probabilities.Trauma || 0), 0) / classifiedEntries.length
    : 0;
  const avgMaintenance = classifiedEntries.length
    ? classifiedEntries.reduce((s, e) => s + (e.data._classification.probabilities.Maintenance || 0), 0) / classifiedEntries.length
    : 0;

  const maxCount = Math.max(...last8Weeks.map(w => w.count), 1);
  const totalEntries = entries.length;
  const vigilantCount = entries.filter(e => e.mode === 'vigilant').length;
  const restoredCount = entries.filter(e => e.mode === 'restored').length;
  const completedCount = entries.filter(e => e.phase === 'analysis').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Dream Trends
          </h2>
          <p className="text-sm text-slate-400">Patterns across your journal</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Entries', value: totalEntries, color: 'text-white' },
          { label: 'Dream (Vigilant)', value: vigilantCount, color: 'text-primary' },
          { label: 'Healing (Restored)', value: restoredCount, color: 'text-secondary' },
          { label: 'Fully Analyzed', value: completedCount, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="font-display font-medium text-white mb-6">Weekly Entry Activity</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No entries yet to show trends.</div>
        ) : (
          <div className="flex items-end gap-2 h-36">
            {last8Weeks.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '100px' }}>
                  {week.count > 0 && (
                    <>
                      <div
                        className="w-full bg-secondary/70 rounded-t-sm"
                        style={{ height: `${(week.restored / maxCount) * 100}px` }}
                      />
                      <div
                        className="w-full bg-primary/80 rounded-t-sm"
                        style={{ height: `${(week.vigilant / maxCount) * 100}px` }}
                      />
                    </>
                  )}
                  {week.count === 0 && (
                    <div className="w-full h-1 bg-slate-800 rounded" />
                  )}
                </div>
                <span className="text-[9px] text-slate-500 font-medium text-center leading-tight">{week.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-4 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-3 rounded-sm bg-primary/80 inline-block"></span>Dream</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3 h-3 rounded-sm bg-secondary/70 inline-block"></span>Healing</span>
        </div>
      </div>

      {/* XAI Averages */}
      {classifiedEntries.length > 0 && (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 shadow-xl">
          <h3 className="font-display font-medium text-white mb-2">Average XAI Dimensions</h3>
          <p className="text-xs text-slate-500 mb-6">Across {classifiedEntries.length} analyzed {classifiedEntries.length === 1 ? 'entry' : 'entries'}</p>
          <div className="space-y-4">
            {[
              { label: 'Spiritual', value: avgSpiritual, gradient: 'from-indigo-600 to-primary' },
              { label: 'Trauma', value: avgTrauma, gradient: 'from-destructive to-orange-500' },
              { label: 'Maintenance', value: avgMaintenance, gradient: 'from-emerald-600 to-teal-400' },
            ].map(dim => (
              <div key={dim.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{dim.label}</span>
                  <span className="text-slate-400 font-mono">{(dim.value * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${dim.gradient}`} style={{ width: `${dim.value * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {classifiedEntries.length === 0 && (
        <div className="bg-slate-900/30 rounded-2xl border border-white/5 border-dashed p-8 text-center">
          <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No XAI data yet</p>
          <p className="text-sm text-slate-500 mt-1">Complete an entry through the Analysis phase to see dimension averages.</p>
        </div>
      )}
    </motion.div>
  );
}

// --- Entry Components ---
function VigilantEntry({ entry, onSave, onBack, onNextPhase }: { entry: JournalEntry, onSave: (d: any) => void, onBack: () => void, onNextPhase: (p: string) => void }) {
  const [formData, setFormData] = useState<Record<string, any>>(entry.data || {});
  const [classification, setClassification] = useState<ClassifyResponse | null>(
    entry.data?._classification || null
  );
  const [copied, setCopied] = useState(false);
  
  const classifyMutation = useClassifyDream();
  
  const phases = [
    { id: 'presleep', label: 'Pre-Sleep', icon: Moon },
    { id: 'capture', label: 'Capture', icon: BookOpen },
    { id: 'response', label: 'Response', icon: Heart },
    { id: 'analysis', label: 'Analysis', icon: Brain },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.id === entry.phase);

  const runClassify = useCallback(() => {
    const fields = collectEntryFields(formData);
    const hasContent = Object.values(fields).some(v => v && v.length > 5);
    if (hasContent) {
      classifyMutation.mutate({ data: { fields } }, {
        onSuccess: (data) => {
          setClassification(data);
          const updated = { ...formData, _classification: data };
          setFormData(updated);
          onSave(updated);
        }
      });
    }
  }, [formData, classifyMutation, onSave]);

  useEffect(() => {
    if (entry.phase === 'analysis' && !classification && !classifyMutation.isPending) {
      runClassify();
    }
  }, [entry.phase]);

  const handleSave = () => onSave(formData);
  const handleNext = () => {
    handleSave();
    if (currentPhaseIndex < phases.length - 1) onNextPhase(phases[currentPhaseIndex + 1].id);
  };

  const handleExport = async () => {
    const text = formatEntryForExport({ ...entry, data: formData });
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-2">
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${i <= currentPhaseIndex ? 'bg-primary' : 'bg-transparent'}`} 
                style={{ width: i <= currentPhaseIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="p-2.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" title="Copy entry to clipboard">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          </button>
          <span className="text-xs font-medium text-slate-400 w-8 text-right">{currentPhaseIndex + 1}/{phases.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={entry.phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {entry.phase === 'presleep' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Moon className="w-7 h-7 text-primary" />
                Pre-Sleep Preparation
              </h2>
              
              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input type="date" value={formData.date || new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[52px]" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Physical State</label>
                  <select value={formData.physicalState || ''} onChange={e => setFormData({ ...formData, physicalState: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none min-h-[52px]">
                    <option value="">Select current state...</option>
                    <option value="rested">Well-rested & Clear</option>
                    <option value="tired">Tired & Fatigued</option>
                    <option value="stressed">Stressed / Anxious</option>
                    <option value="ill">Ill / Medicated</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Incubation Request <span className="text-slate-500 font-normal">— What question do you bring?</span>
                    </label>
                    <SpeechButton value={formData.incubationRequest || ''} onChange={v => setFormData({ ...formData, incubationRequest: v })} />
                  </div>
                  <textarea value={formData.incubationRequest || ''} onChange={e => setFormData({ ...formData, incubationRequest: e.target.value })}
                    placeholder="Lord, tonight I ask that you show me..." rows={3}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-500/20 shadow-lg">
                <h3 className="font-display font-medium text-indigo-200 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 opacity-80" /> Prayer of Protection
                </h3>
                <p className="text-sm text-indigo-100/80 italic leading-relaxed">
                  "Lord, I commit my sleep to You. Guard my mind against deception. Open my spirit to hear Your voice. 
                  Give me wisdom to discern what You reveal. In Jesus' name, Amen."
                </p>
              </div>
            </div>
          )}

          {entry.phase === 'capture' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-primary" />
                Dream Capture
              </h2>
              
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/20 shadow-inner">
                <p className="text-amber-200/90 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 
                  Write immediately upon waking. 95% of detail fades within minutes.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Dream Title</label>
                    <SpeechButton value={formData.title || ''} onChange={v => setFormData({ ...formData, title: v })} />
                  </div>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give this dream a memorable name..." 
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[52px]" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Narrative <span className="text-slate-500 font-normal">— Write in present tense</span>
                    </label>
                    <SpeechButton value={formData.narrative || ''} onChange={v => setFormData({ ...formData, narrative: v })} />
                  </div>
                  <textarea value={formData.narrative || ''} onChange={e => setFormData({ ...formData, narrative: e.target.value })}
                    placeholder="I am standing in... I see... I feel..." rows={8}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none leading-relaxed" />
                  <WordCountHint text={formData.narrative || ''} target={30} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Vivid Details Present</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Vivid Colors', 'Spoken Words', 'Strong Sensations', 'Unusual Clarity'].map(detail => {
                      const isChecked = formData.vividDetails?.includes(detail) || false;
                      return (
                        <label key={detail} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all min-h-[52px] ${isChecked ? 'bg-primary/10 border-primary/50 text-white' : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:bg-slate-800/50'}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${isChecked ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                            {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={isChecked}
                            onChange={e => {
                              const details = formData.vividDetails || [];
                              setFormData({ ...formData, vividDetails: e.target.checked ? [...details, detail] : details.filter((d: string) => d !== detail) });
                            }}
                          />
                          <span className="text-sm font-medium">{detail}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {entry.phase === 'response' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Heart className="w-7 h-7 text-primary" />
                Response & Discernment
              </h2>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="font-display font-medium text-white mb-4">Initial Source Intuition</h3>
                <div className="space-y-3">
                  {[
                    { id: 'biological', label: 'Processing / Biological', desc: 'Fragmented, day residue, scattered' },
                    { id: 'psychological', label: 'Psychological / Shadow', desc: 'Fear, repressed desire, stress' },
                    { id: 'spiritual', label: 'Spiritual / Message', desc: 'Vivid, coherent, leaves a lasting mark' },
                  ].map(source => {
                    const isSelected = formData.sourceTest === source.id;
                    return (
                      <label key={source.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all min-h-[64px] ${isSelected ? 'bg-primary/10 border-primary/50' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-slate-600'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" name="sourceTest" value={source.id} className="hidden" checked={isSelected}
                          onChange={e => setFormData({ ...formData, sourceTest: e.target.value })} />
                        <div>
                          <p className={`font-medium text-sm transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>{source.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{source.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
                <h3 className="font-display font-medium text-white">T-TAQ Analysis</h3>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-300">Theme: Central conflict or plot?</label>
                    <SpeechButton value={formData.theme || ''} onChange={v => setFormData({ ...formData, theme: v })} />
                  </div>
                  <input type="text" value={formData.theme || ''} onChange={e => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-primary outline-none transition-all min-h-[52px]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-300">Affect: What did I feel?</label>
                    <SpeechButton value={formData.affect || ''} onChange={v => setFormData({ ...formData, affect: v })} />
                  </div>
                  <input type="text" value={formData.affect || ''} onChange={e => setFormData({ ...formData, affect: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-primary outline-none transition-all min-h-[52px]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-300">Question: What does this ask of my waking life?</label>
                    <SpeechButton value={formData.question || ''} onChange={v => setFormData({ ...formData, question: v })} />
                  </div>
                  <input type="text" value={formData.question || ''} onChange={e => setFormData({ ...formData, question: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-primary outline-none transition-all min-h-[52px]" />
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="font-display font-medium text-white mb-4">Emotional Fruit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setFormData({ ...formData, emotionalFruit: 'consolation' })}
                    className={`p-5 rounded-xl border text-left transition-all min-h-[80px] ${formData.emotionalFruit === 'consolation' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-900/20' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}>
                    <h4 className={`font-medium mb-1 ${formData.emotionalFruit === 'consolation' ? 'text-emerald-300' : 'text-slate-300'}`}>Consolation</h4>
                    <p className="text-xs text-slate-500">Peace, faith, hope, love</p>
                  </button>
                  <button onClick={() => setFormData({ ...formData, emotionalFruit: 'desolation' })}
                    className={`p-5 rounded-xl border text-left transition-all min-h-[80px] ${formData.emotionalFruit === 'desolation' ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}>
                    <h4 className={`font-medium mb-1 ${formData.emotionalFruit === 'desolation' ? 'text-red-300' : 'text-slate-300'}`}>Desolation</h4>
                    <p className="text-xs text-slate-500">Fear, confusion, anxiety</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-200">Synthesis: What is God showing me?</label>
                  <SpeechButton value={formData.interpretation || ''} onChange={v => setFormData({ ...formData, interpretation: v })} />
                </div>
                <textarea value={formData.interpretation || ''} onChange={e => setFormData({ ...formData, interpretation: e.target.value })}
                  placeholder="I believe the core message is..."
                  rows={4} className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary outline-none transition-all resize-none" />
              </div>
            </div>
          )}

          {entry.phase === 'analysis' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Brain className="w-7 h-7 text-primary" />
                Clearbox XAI Analysis
              </h2>
              <ClearboxAnalysis 
                classification={classification}
                entryData={formData}
                mode="vigilant"
                isLoading={classifyMutation.isPending}
                error={classifyMutation.error?.message || null}
                onReclassify={() => { setClassification(null); runClassify(); }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-6 border-t border-white/10 mt-8 flex-wrap">
        {currentPhaseIndex > 0 && (
          <button onClick={() => onNextPhase(phases[currentPhaseIndex - 1].id)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors min-h-[52px]">
            Back
          </button>
        )}
        <div className="flex-1"></div>
        <button onClick={handleSave} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors min-h-[52px]">
          Save Draft
        </button>
        {currentPhaseIndex < phases.length - 1 ? (
          <button onClick={handleNext}
            className="px-7 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 min-h-[52px]">
            Next: {phases[currentPhaseIndex + 1].label}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => { handleSave(); onBack(); }}
            className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95 min-h-[52px]">
            <Check className="w-5 h-5" />
            Complete Entry
          </button>
        )}
      </div>
    </div>
  );
}

function RestoredEntry({ entry, onSave, onBack, onNextPhase }: { entry: JournalEntry, onSave: (d: any) => void, onBack: () => void, onNextPhase: (p: string) => void }) {
  const [formData, setFormData] = useState<Record<string, any>>(entry.data || {});
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [classification, setClassification] = useState<ClassifyResponse | null>(
    entry.data?._classification || null
  );
  const [copied, setCopied] = useState(false);
  
  const classifyMutation = useClassifyDream();

  const phases = [
    { id: 'evening', label: 'Evening', icon: Moon },
    { id: 'witness', label: 'Witness', icon: BookOpen },
    { id: 'restoration', label: 'Restoration', icon: Heart },
    { id: 'release', label: 'Release', icon: Sparkles },
    { id: 'analysis', label: 'Analysis', icon: Brain },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.id === entry.phase);

  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setBreathCount(prev => {
        if (prev <= 1) {
          setBreathPhase(p => p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale');
          return breathPhase === 'exhale' ? 4 : breathPhase === 'hold' ? 6 : 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  const runClassify = useCallback(() => {
    const fields = collectEntryFields(formData);
    const hasContent = Object.values(fields).some(v => v && v.length > 5);
    if (hasContent) {
      classifyMutation.mutate({ data: { fields } }, {
        onSuccess: (data) => {
          setClassification(data);
          const updated = { ...formData, _classification: data };
          setFormData(updated);
          onSave(updated);
        }
      });
    }
  }, [formData, classifyMutation, onSave]);

  useEffect(() => {
    if (entry.phase === 'analysis' && !classification && !classifyMutation.isPending) {
      runClassify();
    }
  }, [entry.phase]);

  const handleSave = () => onSave(formData);
  const handleNext = () => {
    handleSave();
    if (currentPhaseIndex < phases.length - 1) onNextPhase(phases[currentPhaseIndex + 1].id);
  };

  const handleExport = async () => {
    const text = formatEntryForExport({ ...entry, data: formData });
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-2">
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${i <= currentPhaseIndex ? 'bg-secondary' : 'bg-transparent'}`} 
                style={{ width: i <= currentPhaseIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="p-2.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" title="Copy entry to clipboard">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          </button>
          <span className="text-xs font-medium text-slate-400 w-8 text-right">{currentPhaseIndex + 1}/{phases.length}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={entry.phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {entry.phase === 'evening' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Moon className="w-7 h-7 text-secondary" />
                Evening Grounding
              </h2>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-8 shadow-xl text-center">
                <h3 className="font-display font-medium text-white mb-8">4-4-6 Nervous System Reset</h3>
                <div className="py-6 flex flex-col items-center">
                  <div className={`relative w-40 h-40 rounded-full flex items-center justify-center text-5xl font-display font-bold text-white transition-all duration-1000 ease-in-out shadow-[0_0_40px_rgba(0,0,0,0.3)]
                    ${breathPhase === 'inhale' ? 'bg-blue-500/40 scale-125 border border-blue-400/50' : 
                      breathPhase === 'hold' ? 'bg-purple-500/40 scale-100 border border-purple-400/50' : 
                      'bg-teal-500/40 scale-75 border border-teal-400/50'}`}>
                    {breathCount}
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                  <p className="mt-8 text-xl font-medium tracking-wider uppercase text-slate-300 transition-colors">
                    {breathPhase}
                  </p>
                  <button onClick={() => {
                    if (!breathingActive) { setBreathPhase('inhale'); setBreathCount(4); }
                    setBreathingActive(!breathingActive);
                  }}
                    className={`mt-6 px-8 py-3.5 rounded-xl font-medium transition-all min-h-[52px] ${breathingActive ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:bg-secondary/90'}`}>
                    {breathingActive ? 'Stop Exercise' : 'Begin Breathing'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">Stress Level</label>
                      <span className="text-secondary font-bold">{formData.stressLevel || 5}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={formData.stressLevel || 5}
                      onChange={e => setFormData({ ...formData, stressLevel: e.target.value })} 
                      className="w-full accent-secondary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Physical State</label>
                    <select value={formData.physicalState || ''} onChange={e => setFormData({ ...formData, physicalState: e.target.value })}
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all appearance-none min-h-[52px]">
                      <option value="">Select state...</option>
                      <option value="tense">Tense & Wired</option>
                      <option value="tired">Exhausted</option>
                      <option value="okay">Manageable</option>
                      <option value="calm">Calm & Settled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Release today's concerns</label>
                    <SpeechButton value={formData.concerns || ''} onChange={v => setFormData({ ...formData, concerns: v })} />
                  </div>
                  <textarea value={formData.concerns || ''} onChange={e => setFormData({ ...formData, concerns: e.target.value })}
                    placeholder="Write them down and let them go into God's hands..." rows={3}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all resize-none" />
                </div>
              </div>
            </div>
          )}

          {entry.phase === 'witness' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-secondary" />
                The Witness
              </h2>

              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/20 shadow-inner flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-amber-200/90 text-sm leading-relaxed">
                  <strong>Do Not Relive the Dream.</strong> Capture only the core essence without emotionally re-engaging with the narrative. Keep it brief.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-4 text-center">Did you experience a nightmare or threat simulation?</label>
                  <div className="flex gap-4">
                    <button onClick={() => setFormData({ ...formData, hadNightmare: true })}
                      className={`flex-1 py-4 rounded-xl font-medium border-2 transition-all min-h-[56px] ${formData.hadNightmare === true ? 'bg-red-950/40 border-red-500 text-red-200 shadow-lg shadow-red-900/20' : 'bg-slate-950/50 border-transparent text-slate-400 hover:bg-slate-800'}`}>
                      Yes, a Nightmare
                    </button>
                    <button onClick={() => setFormData({ ...formData, hadNightmare: false })}
                      className={`flex-1 py-4 rounded-xl font-medium border-2 transition-all min-h-[56px] ${formData.hadNightmare === false ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-900/20' : 'bg-slate-950/50 border-transparent text-slate-400 hover:bg-slate-800'}`}>
                      No, Peaceful Night
                    </button>
                  </div>
                </div>

                {formData.hadNightmare && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-4 border-t border-white/10">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Dream Title</label>
                        <SpeechButton value={formData.title || ''} onChange={v => setFormData({ ...formData, title: v })} />
                      </div>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-red-500 outline-none transition-all min-h-[52px]" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Core Threat <span className="text-slate-500 font-normal">(One sentence maximum)</span></label>
                        <SpeechButton value={formData.coreThreat || ''} onChange={v => setFormData({ ...formData, coreThreat: v })} />
                      </div>
                      <input type="text" value={formData.coreThreat || ''} onChange={e => setFormData({ ...formData, coreThreat: e.target.value })}
                        placeholder="The dream threatened me by..." 
                        className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-red-500 outline-none transition-all min-h-[52px]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Dominant Emotion</label>
                      <div className="flex flex-wrap gap-2">
                        {['Terror', 'Dread', 'Shame', 'Helplessness', 'Confusion', 'Rage', 'Grief'].map(emotion => {
                          const isSelected = formData.dominantEmotion === emotion;
                          return (
                            <button key={emotion} onClick={() => setFormData({ ...formData, dominantEmotion: emotion })}
                              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all min-h-[40px] ${isSelected ? 'bg-red-950/50 border-red-500/60 text-red-200' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}>
                              {emotion}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Dream Sign <span className="text-slate-500 font-normal">(Recurring structural element)</span></label>
                        <SpeechButton value={formData.dreamSign || ''} onChange={v => setFormData({ ...formData, dreamSign: v })} />
                      </div>
                      <input type="text" value={formData.dreamSign || ''} onChange={e => setFormData({ ...formData, dreamSign: e.target.value })}
                        placeholder="e.g., trying to run but legs feel heavy..." 
                        className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-red-500 outline-none transition-all min-h-[52px]" />
                    </div>
                  </motion.div>
                )}

                {formData.hadNightmare === false && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-emerald-950/50 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                      <Check className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-emerald-300 mb-2">Victory in Rest</h3>
                    <p className="text-slate-400">Praise God for a peaceful night. You can proceed to complete your entry.</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {entry.phase === 'restoration' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Heart className="w-7 h-7 text-secondary" />
                Restoration (IRT)
              </h2>

              {formData.hadNightmare === false ? (
                <div className="bg-slate-900/50 backdrop-blur rounded-2xl p-12 text-center border border-white/5 shadow-xl">
                  <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No nightmare to restore. Skip ahead to Release.</p>
                </div>
              ) : (
                <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                  {formData.coreThreat && (
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Core Threat Identified:</p>
                      <p className="text-slate-200">{formData.coreThreat}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">Intervention Point</label>
                      <SpeechButton value={formData.interventionPoint || ''} onChange={v => setFormData({ ...formData, interventionPoint: v })} />
                    </div>
                    <input type="text" value={formData.interventionPoint || ''} onChange={e => setFormData({ ...formData, interventionPoint: e.target.value })}
                      placeholder="The exact moment before the threat takes control..."
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all min-h-[52px]" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">Mastery Action <span className="text-slate-500 font-normal">— How will you respond differently?</span></label>
                      <SpeechButton value={formData.masteryAction || ''} onChange={v => setFormData({ ...formData, masteryAction: v })} />
                    </div>
                    <textarea value={formData.masteryAction || ''} onChange={e => setFormData({ ...formData, masteryAction: e.target.value })}
                      placeholder="I recognize this is a dream. I turn, face the threat, and command it to leave in Jesus' name..." rows={3}
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all resize-none" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">The Safe Ending</label>
                      <SpeechButton value={formData.safeEnding || ''} onChange={v => setFormData({ ...formData, safeEnding: v })} />
                    </div>
                    <textarea value={formData.safeEnding || ''} onChange={e => setFormData({ ...formData, safeEnding: e.target.value })}
                      placeholder="Rewrite the ending here so it resolves peacefully..." rows={4}
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all resize-none" />
                    <WordCountHint text={formData.safeEnding || ''} target={20} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">Recognition Statement</label>
                      <SpeechButton value={formData.recognitionStatement || ''} onChange={v => setFormData({ ...formData, recognitionStatement: v })} />
                    </div>
                    <input type="text" value={formData.recognitionStatement || ''} onChange={e => setFormData({ ...formData, recognitionStatement: e.target.value })}
                      placeholder="In this dream, I learned that I have authority over..."
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3.5 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all min-h-[52px]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {entry.phase === 'release' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-secondary" />
                Spiritual Release
              </h2>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-6 rounded-xl border border-purple-500/20">
                  <h3 className="font-display font-medium text-purple-200 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 opacity-80" /> Anchoring Truth
                  </h3>
                  <div className="space-y-4">
                    {SCRIPTURES[formData.hadNightmare ? 'fear' : 'protection'].map((s, i) => (
                      <div key={i} className="pl-4 border-l-2 border-purple-500/30">
                        <p className="text-sm text-slate-200 italic mb-1">"{s.text}"</p>
                        <p className="text-xs text-purple-300/80">— {s.ref}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Spiritual Declaration</label>
                    <SpeechButton value={formData.spiritualDeclaration || ''} onChange={v => setFormData({ ...formData, spiritualDeclaration: v })} />
                  </div>
                  <textarea value={formData.spiritualDeclaration || ''} onChange={e => setFormData({ ...formData, spiritualDeclaration: e.target.value })}
                    placeholder="I declare that God has not given me a spirit of fear..." rows={3}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all resize-none" />
                </div>
              </div>
            </div>
          )}

          {entry.phase === 'analysis' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <Brain className="w-7 h-7 text-secondary" />
                Clearbox XAI Analysis
              </h2>
              <ClearboxAnalysis 
                classification={classification}
                entryData={formData}
                mode="restored"
                isLoading={classifyMutation.isPending}
                error={classifyMutation.error?.message || null}
                onReclassify={() => { setClassification(null); runClassify(); }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-6 border-t border-white/10 mt-8 flex-wrap">
        {currentPhaseIndex > 0 && (
          <button onClick={() => onNextPhase(phases[currentPhaseIndex - 1].id)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors min-h-[52px]">
            Back
          </button>
        )}
        <div className="flex-1"></div>
        <button onClick={handleSave} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors min-h-[52px]">
          Save Draft
        </button>
        {currentPhaseIndex < phases.length - 1 ? (
          <button onClick={handleNext}
            className="px-7 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-secondary/20 transition-all active:scale-95 min-h-[52px]">
            Next: {phases[currentPhaseIndex + 1].label}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => { handleSave(); onBack(); }}
            className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95 min-h-[52px]">
            <Check className="w-5 h-5" />
            Complete Healing
          </button>
        )}
      </div>
    </div>
  );
}

// --- Main View ---
export default function Journal() {
  const [mode, setMode] = useState<JournalMode>('vigilant');
  const [currentView, setCurrentView] = useState<'home' | 'entry' | 'trends'>('home');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [show3AMProtocol, setShow3AMProtocol] = useState(false);
  const [copiedEntry, setCopiedEntry] = useState<number | null>(null);
  
  const { entries, addOrUpdateEntry, isLoaded } = useJournalEntries();
  const { data: apiStatus } = useModelHealth();

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  const modeEntries = entries.filter(e => e.mode === mode).slice(-7).reverse();
  const timeOfDay = new Date().getHours();
  const isEvening = timeOfDay >= 18 || timeOfDay < 6;
  const scripture = getDailyScripture(SCRIPTURES[mode === 'vigilant' ? 'dreams' : 'protection']);

  const startNewEntry = (isMorning: boolean) => {
    let phase: JournalEntry['phase'];
    if (mode === 'vigilant') {
      phase = isMorning ? 'capture' : 'presleep';
    } else {
      phase = isMorning ? 'witness' : 'evening';
    }
    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode,
      phase,
      data: {}
    };
    setCurrentEntry(newEntry);
    setCurrentView('entry');
  };

  const handleSaveEntry = (data: any) => {
    if (!currentEntry) return;
    const updated = { ...currentEntry, data: { ...currentEntry.data, ...data } };
    setCurrentEntry(updated);
    addOrUpdateEntry(updated);
  };

  const handleExportEntryCard = async (entry: JournalEntry) => {
    const text = formatEntryForExport(entry);
    const ok = await copyToClipboard(text);
    if (ok) { setCopiedEntry(entry.id); setTimeout(() => setCopiedEntry(null), 2500); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 z-[-1] opacity-30 mix-blend-overlay pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/mystic-bg.png)` }}
      />
      
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <Moon className={`w-5 h-5 ${mode === 'vigilant' ? 'text-primary' : 'text-secondary'}`} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-semibold text-white leading-tight">
                {mode === 'vigilant' ? 'Vigilant Spirit' : 'The Restored Night'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Dream Journal</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <a
              href="/xai-explorer/"
              className="p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10"
              title="XAI Explorer"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={() => setCurrentView(currentView === 'trends' ? 'home' : 'trends')}
              className={`p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${currentView === 'trends' ? 'bg-slate-800 text-primary' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
              title="Trends"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <div className="flex p-1 bg-slate-900 rounded-lg border border-white/5">
              <button
                onClick={() => { setMode('vigilant'); setCurrentView('home'); }}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 min-h-[40px] ${
                  mode === 'vigilant' ? 'bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Dream</span>
              </button>
              <button
                onClick={() => { setMode('restored'); setCurrentView('home'); }}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 min-h-[40px] ${
                  mode === 'restored' ? 'bg-slate-800 text-secondary shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Healing</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className={`px-5 py-1.5 text-xs flex justify-center items-center font-medium ${apiStatus?.status === 'healthy' ? 'bg-emerald-950/50 text-emerald-400 border-b border-emerald-900/50' : 'bg-amber-950/50 text-amber-400 border-b border-amber-900/50'}`}>
          {apiStatus?.status === 'healthy' 
            ? `✓ Model Online • ${apiStatus.features} features loaded • XAI Ready`
            : '⚠ Using Fallback Local Classification (Model Offline)'}
        </div>
      </header>

      {/* 3 AM Protocol Modal */}
      <AnimatePresence>
        {show3AMProtocol && <Protocol3AMModal onClose={() => setShow3AMProtocol(false)} />}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">

          {currentView === 'trends' && (
            <TrendsView 
              key="trends"
              entries={entries}
              onBack={() => setCurrentView('home')}
            />
          )}

          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Welcome Card */}
              <div className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border ${
                mode === 'vigilant' 
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900/90 border-indigo-500/20'
                  : 'bg-gradient-to-br from-purple-950/80 to-slate-900/90 border-purple-500/20'
              }`}>
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${mode === 'vigilant' ? 'bg-primary' : 'bg-secondary'}`} />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${mode === 'vigilant' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-purple-900/50 text-purple-300'}`}>
                      {isEvening ? <Moon className="w-6 h-6 sm:w-7 sm:h-7" /> : <Sun className="w-6 h-6 sm:w-7 sm:h-7" />}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-2">
                        {isEvening ? 'Good Evening' : 'Good Morning'}
                      </h2>
                      <p className="text-slate-300 mb-5 leading-relaxed max-w-md text-sm sm:text-base">
                        {mode === 'vigilant' 
                          ? isEvening 
                            ? "Prepare your heart for divine communication tonight. Let go of the day's residue."
                            : "Capture your dream immediately. The details fade rapidly as waking life rushes in."
                          : isEvening
                            ? "Complete your evening grounding for safe, restorative sleep."
                            : "If you had a nightmare, process it safely using Image Rehearsal Therapy."
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => startNewEntry(true)}
                          className={`px-5 py-3.5 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95 min-h-[52px] ${
                            mode === 'vigilant' 
                              ? 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90' 
                              : 'bg-secondary text-secondary-foreground shadow-secondary/20 hover:bg-secondary/90'
                          }`}
                        >
                          <Sun className="w-5 h-5" />
                          Good Morning: Capture Dream
                        </button>
                        <button
                          onClick={() => startNewEntry(false)}
                          className={`px-5 py-3.5 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95 min-h-[52px] ${
                            mode === 'vigilant'
                              ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-800/60'
                              : 'bg-purple-900/60 text-purple-200 border border-purple-500/30 hover:bg-purple-800/60'
                          }`}
                        >
                          <Moon className="w-5 h-5" />
                          Good Evening: Prepare for Sleep
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scripture Box — daily rotation */}
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:bg-slate-900/60 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-slate-500 to-transparent opacity-50" />
                <p className="text-lg text-slate-200 font-serif italic mb-3">
                  "{scripture.text}"
                </p>
                <p className="text-slate-500 text-sm font-medium tracking-wide">— {scripture.ref}</p>
              </div>

              {/* Quick Actions (Restored only) */}
              {mode === 'restored' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShow3AMProtocol(true)}
                    className="bg-red-950/30 border border-red-900/50 rounded-2xl p-5 text-left hover:bg-red-950/50 transition-colors group min-h-[100px]">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-display font-medium text-red-200 text-lg">3 AM Protocol</h3>
                    <p className="text-sm text-red-200/60 mt-1">Emergency grounding techniques</p>
                  </button>
                  <button className="bg-teal-950/30 border border-teal-900/50 rounded-2xl p-5 text-left hover:bg-teal-950/50 transition-colors group min-h-[100px]"
                    onClick={() => {
                      const newEntry: JournalEntry = { id: Date.now(), date: new Date().toISOString(), mode: 'restored', phase: 'evening', data: {} };
                      setCurrentEntry(newEntry);
                      setCurrentView('entry');
                    }}
                  >
                    <Heart className="w-8 h-8 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-display font-medium text-teal-200 text-lg">4-4-6 Breathing</h3>
                    <p className="text-sm text-teal-200/60 mt-1">Regulate your nervous system</p>
                  </button>
                </div>
              )}

              {/* Recent Entries */}
              <div>
                <h3 className="text-xl font-display font-semibold text-white mb-5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                  Recent Journal
                </h3>
                {modeEntries.length > 0 ? (
                  <div className="grid gap-3">
                    {modeEntries.map(entry => (
                      <div key={entry.id} className="w-full bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center overflow-hidden group">
                        <button
                          onClick={() => { setCurrentEntry(entry); setCurrentView('entry'); }}
                          className="flex-1 p-4 sm:p-5 text-left flex justify-between items-center gap-3 min-h-[72px]"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-200 text-base group-hover:text-white transition-colors truncate">{entry.data.title || 'Untitled Session'}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-sm text-slate-500 font-medium">
                                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                entry.phase === 'analysis' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}>
                                {entry.phase}
                              </span>
                              {entry.data._classification && (
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border bg-indigo-950/50 border-indigo-900 text-indigo-400">
                                  XAI ✓
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white shrink-0" />
                        </button>
                        <button
                          onClick={() => handleExportEntryCard(entry)}
                          className="p-3 text-slate-600 hover:text-slate-300 border-l border-white/5 hover:bg-white/5 transition-colors self-stretch flex items-center min-w-[48px] justify-center"
                          title="Copy entry"
                        >
                          {copiedEntry === entry.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 rounded-2xl border border-white/5 border-dashed p-10 sm:p-14 text-center">
                    <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                      {mode === 'vigilant' 
                        ? <Moon className="w-10 h-10 text-slate-600" />
                        : <Shield className="w-10 h-10 text-slate-600" />
                      }
                    </div>
                    <p className="text-slate-300 font-display font-medium text-lg mb-2">
                      {mode === 'vigilant' ? 'Your dream journal awaits' : 'Your healing journey begins here'}
                    </p>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                      {mode === 'vigilant'
                        ? 'Each morning is an opportunity to receive what God speaks in the night. Begin your first entry.'
                        : 'The Restored Night helps you process nightmares safely and find peace. Start tonight.'}
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => startNewEntry(true)}
                        className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all active:scale-95 min-h-[48px] ${
                          mode === 'vigilant'
                            ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30'
                            : 'bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        Good Morning: Capture Dream
                      </button>
                      <button
                        onClick={() => startNewEntry(false)}
                        className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all active:scale-95 min-h-[48px] ${
                          mode === 'vigilant'
                            ? 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-600/30'
                            : 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-600/30'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        Good Evening: Prepare for Sleep
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'entry' && currentEntry && (
            <motion.div 
              key="entry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {mode === 'vigilant' ? (
                <VigilantEntry 
                  entry={currentEntry}
                  onSave={handleSaveEntry}
                  onBack={() => setCurrentView('home')}
                  onNextPhase={(phase) => {
                    const updated = { ...currentEntry, phase };
                    setCurrentEntry(updated);
                    addOrUpdateEntry(updated);
                  }}
                />
              ) : (
                <RestoredEntry
                  entry={currentEntry}
                  onSave={handleSaveEntry}
                  onBack={() => setCurrentView('home')}
                  onNextPhase={(phase) => {
                    const updated = { ...currentEntry, phase };
                    setCurrentEntry(updated);
                    addOrUpdateEntry(updated);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
