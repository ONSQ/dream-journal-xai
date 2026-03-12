import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, BookOpen, Shield, Brain, Heart, ChevronRight, 
  ChevronDown, Sparkles, AlertTriangle, Check, X, Plus, Zap, Loader2 
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
  ],
  fear: [
    { text: "For God gave us a spirit not of fear but of power and love and self-control.", ref: "2 Timothy 1:7" },
    { text: "When I am afraid, I put my trust in you.", ref: "Psalm 56:3" },
  ],
  dreams: [
    { text: "For God does speak—now one way, now another—though no one perceives it. In a dream, in a vision of the night...", ref: "Job 33:14-15" },
    { text: "In the last days, God says, I will pour out my Spirit on all people. Your sons and daughters will prophesy, your young men will see visions, your old men will dream dreams.", ref: "Acts 2:17" },
  ]
};

const SOURCE_INTERPRETATIONS: Record<string, any> = {
  spiritual_dominant: { title: "Potentially Divine Communication", icon: "✨", color: "indigo", guidance: "Apply the Discernment Checklist: Does it align with Scripture? Does it produce peace?" },
  trauma_dominant: { title: "Trauma Processing / Threat Simulation", icon: "⚠️", color: "red", guidance: "Consider using IRT to rewrite this dream with a safe ending." },
  maintenance_dominant: { title: "Biological Processing", icon: "🧠", color: "green", guidance: "Standard maintenance dream. No special action required." },
  mixed_spiritual_trauma: { title: "Spiritual Warfare / Shadow Work", icon: "⚔️", color: "purple", guidance: "This may represent spiritual warfare or areas requiring healing." },
  mixed_all: { title: "Complex Multi-Dimensional Dream", icon: "🔮", color: "slate", guidance: "Apply careful discernment." }
};

// --- Helpers ---
function collectAllEntryText(data: Record<string, any>): string {
  const fields = [
    data.title, data.narrative, data.incubationRequest, data.theme,
    data.affect, data.question, data.interpretation, data.coreThreat,
    data.dominantEmotion, data.dreamSign, data.masteryAction,
    data.safeEnding, data.interventionPoint, data.recognitionStatement, data.concerns
  ];
  return fields.filter(Boolean).join(' ');
}

// --- Components ---
function ClearboxAnalysis({ classification, entryData, isLoading, error }: { 
  classification: ClassifyResponse | null; 
  entryData: any; 
  mode: JournalMode; 
  isLoading: boolean; 
  error: string | null 
}) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Analyzing dream dimensions...</p>
        <p className="text-slate-500 text-sm mt-2">Running XAI classification</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/20 border border-destructive/50 rounded-2xl p-6 shadow-lg shadow-destructive/5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-destructive-foreground mb-2">Analysis Failed</h3>
            <p className="text-slate-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!classification) return null;
  
  const sourceInfo = classification.sourceInfo || SOURCE_INTERPRETATIONS[classification.sourceType] || SOURCE_INTERPRETATIONS.mixed_all;
  
  const dimensions = [
    { key: 'Spiritual', color: 'indigo', gradient: 'from-indigo-600 to-primary' },
    { key: 'Trauma', color: 'red', gradient: 'from-destructive to-orange-500' },
    { key: 'Maintenance', color: 'green', gradient: 'from-emerald-600 to-teal-400' }
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-emerald-900/20">
        <Zap className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="text-emerald-200 text-sm font-medium">XAI Classification Complete</p>
          <p className="text-emerald-400/70 text-xs">Powered by SHAP + LIME explainability</p>
        </div>
      </div>

      <div className={`bg-slate-800/40 border border-white/10 rounded-2xl p-6 shadow-xl`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl drop-shadow-md">{sourceInfo.icon}</div>
          <div>
            <h3 className="text-xl font-display text-white mb-2">{sourceInfo.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{sourceInfo.guidance}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
        <h4 className="font-display text-lg mb-5 flex items-center gap-2 text-white">
          <Eye className="w-5 h-5 text-primary" />
          Dimensional Breakdown
        </h4>
        <div className="space-y-5">
          {dimensions.map(dim => {
            const probKey = dim.key as keyof typeof classification.probabilities;
            const prob = classification.probabilities[probKey] || 0;
            const isExpanded = expandedDim === dim.key;
            
            return (
              <div key={dim.key} className="space-y-2">
                <button 
                  onClick={() => setExpandedDim(isExpanded ? null : dim.key)} 
                  className="w-full group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-slate-200 flex items-center gap-2 group-hover:text-white transition-colors">
                      {dim.key}
                      {prob > 0.5 && <Check className="w-4 h-4 text-emerald-400" />}
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                    <span className={`font-mono font-medium ${prob > 0.5 ? 'text-white' : 'text-slate-500'}`}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${dim.gradient} transition-all duration-1000 ease-out`}
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
                      <div className="mt-3 p-5 bg-slate-800/50 rounded-xl border border-white/5 space-y-5">
                        {classification.dimensionInterpretations && (
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {classification.dimensionInterpretations[dim.key as keyof typeof classification.dimensionInterpretations]}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> SHAP Features
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {classification.shap[probKey]?.map((f, i) => (
                                <span key={i} className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-md text-xs text-emerald-100">
                                  "{f.word}" <span className="opacity-60">{f.weight > 0 ? '+' : ''}{f.weight.toFixed(2)}</span>
                                </span>
                              ))}
                              {(!classification.shap[probKey] || classification.shap[probKey].length === 0) && (
                                <span className="text-xs text-slate-500">None detected</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
                              <Brain className="w-3 h-3" /> LIME Features
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {classification.lime[probKey]?.map((f, i) => (
                                <span key={i} className="px-2 py-1 bg-amber-950/40 border border-amber-500/30 rounded-md text-xs text-amber-100">
                                  "{f.word}" <span className="opacity-60">{f.weight > 0 ? '+' : ''}{f.weight.toFixed(2)}</span>
                                </span>
                              ))}
                              {(!classification.lime[probKey] || classification.lime[probKey].length === 0) && (
                                <span className="text-xs text-slate-500">None detected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

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

function VigilantEntry({ entry, onSave, onBack, onNextPhase }: { entry: JournalEntry, onSave: (d: any) => void, onBack: () => void, onNextPhase: (p: string) => void }) {
  const [formData, setFormData] = useState<Record<string, any>>(entry.data || {});
  const [classification, setClassification] = useState<ClassifyResponse | null>(null);
  
  const classifyMutation = useClassifyDream();
  
  const phases = [
    { id: 'presleep', label: 'Pre-Sleep', icon: Moon },
    { id: 'capture', label: 'Capture', icon: BookOpen },
    { id: 'response', label: 'Response', icon: Heart },
    { id: 'analysis', label: 'Analysis', icon: Brain },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.id === entry.phase);

  useEffect(() => {
    if (entry.phase === 'analysis' && !classification && !classifyMutation.isPending) {
      const text = collectAllEntryText(formData);
      if (text.length > 10) {
        classifyMutation.mutate({ data: { text } }, {
          onSuccess: (data) => setClassification(data)
        });
      }
    }
  }, [entry.phase, formData]);

  const handleSave = () => onSave(formData);
  const handleNext = () => {
    handleSave();
    if (currentPhaseIndex < phases.length - 1) onNextPhase(phases[currentPhaseIndex + 1].id);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-2">
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${i <= currentPhaseIndex ? 'bg-primary' : 'bg-transparent'}`} 
                style={{ width: i < currentPhaseIndex ? '100%' : i === currentPhaseIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs font-medium text-slate-400 w-8 text-right">{currentPhaseIndex + 1}/{phases.length}</span>
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
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Physical State</label>
                  <select value={formData.physicalState || ''} onChange={e => setFormData({ ...formData, physicalState: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Select current state...</option>
                    <option value="rested">Well-rested & Clear</option>
                    <option value="tired">Tired & Fatigued</option>
                    <option value="stressed">Stressed / Anxious</option>
                    <option value="ill">Ill / Medicated</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Incubation Request <span className="text-slate-500 font-normal ml-1">— What question do you bring?</span>
                  </label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dream Title</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give this dream a memorable name..." 
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Narrative <span className="text-slate-500 font-normal ml-1">— Write in present tense</span>
                  </label>
                  <textarea value={formData.narrative || ''} onChange={e => setFormData({ ...formData, narrative: e.target.value })}
                    placeholder="I am standing in... I see... I feel..." rows={8}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none leading-relaxed" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Vivid Details Present</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Vivid Colors', 'Spoken Words', 'Strong Sensations', 'Unusual Clarity'].map(detail => {
                      const isChecked = formData.vividDetails?.includes(detail) || false;
                      return (
                        <label key={detail} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-primary/10 border-primary/50 text-white' : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:bg-slate-800/50'}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-slate-600'}`}>
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
                      <label key={source.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary/50' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'}`}>
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
                  <label className="block text-sm text-slate-300 mb-2">Theme: Central conflict or plot?</label>
                  <input type="text" value={formData.theme || ''} onChange={e => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Affect: What did I feel?</label>
                  <input type="text" value={formData.affect || ''} onChange={e => setFormData({ ...formData, affect: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Question: What does this ask of my waking life?</label>
                  <input type="text" value={formData.question || ''} onChange={e => setFormData({ ...formData, question: e.target.value })}
                    className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-primary outline-none transition-all" />
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="font-display font-medium text-white mb-4">Emotional Fruit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setFormData({ ...formData, emotionalFruit: 'consolation' })}
                    className={`p-5 rounded-xl border text-left transition-all ${formData.emotionalFruit === 'consolation' ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-900/20' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}>
                    <h4 className={`font-medium mb-1 ${formData.emotionalFruit === 'consolation' ? 'text-emerald-300' : 'text-slate-300'}`}>Consolation</h4>
                    <p className="text-xs text-slate-500">Peace, faith, hope, love</p>
                  </button>
                  <button onClick={() => setFormData({ ...formData, emotionalFruit: 'desolation' })}
                    className={`p-5 rounded-xl border text-left transition-all ${formData.emotionalFruit === 'desolation' ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'}`}>
                    <h4 className={`font-medium mb-1 ${formData.emotionalFruit === 'desolation' ? 'text-red-300' : 'text-slate-300'}`}>Desolation</h4>
                    <p className="text-xs text-slate-500">Fear, confusion, anxiety</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
                <label className="block text-sm font-medium text-slate-200 mb-3">Synthesis: What is God showing me?</label>
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
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4 pt-6 border-t border-white/10 mt-8">
        {currentPhaseIndex > 0 && (
          <button onClick={() => onNextPhase(phases[currentPhaseIndex - 1].id)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
            Back
          </button>
        )}
        <div className="flex-1"></div>
        <button onClick={handleSave} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
          Save Draft
        </button>
        {currentPhaseIndex < phases.length - 1 ? (
          <button onClick={handleNext}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
            Next: {phases[currentPhaseIndex + 1].label}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => { handleSave(); onBack(); }}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95">
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
  const [classification, setClassification] = useState<ClassifyResponse | null>(null);
  
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
          return breathPhase === 'exhale' ? 4 : breathPhase === 'hold' ? 6 : 4; // next phase start count
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  useEffect(() => {
    if (entry.phase === 'analysis' && !classification && !classifyMutation.isPending) {
      const text = collectAllEntryText(formData);
      if (text.length > 10) {
        classifyMutation.mutate({ data: { text } }, {
          onSuccess: (data) => setClassification(data)
        });
      }
    }
  }, [entry.phase, formData]);

  const handleSave = () => onSave(formData);
  const handleNext = () => {
    handleSave();
    if (currentPhaseIndex < phases.length - 1) onNextPhase(phases[currentPhaseIndex + 1].id);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-2">
          {phases.map((phase, i) => (
            <div key={phase.id} className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${i <= currentPhaseIndex ? 'bg-secondary' : 'bg-transparent'}`} 
                style={{ width: i < currentPhaseIndex ? '100%' : i === currentPhaseIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs font-medium text-slate-400 w-8 text-right">{currentPhaseIndex + 1}/{phases.length}</span>
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
                    className={`mt-6 px-8 py-3 rounded-xl font-medium transition-all ${breathingActive ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:bg-secondary/90'}`}>
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
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all appearance-none">
                      <option value="">Select state...</option>
                      <option value="tense">Tense & Wired</option>
                      <option value="tired">Exhausted</option>
                      <option value="okay">Manageable</option>
                      <option value="calm">Calm & Settled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Release today's concerns</label>
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
                      className={`flex-1 py-4 rounded-xl font-medium border-2 transition-all ${formData.hadNightmare === true ? 'bg-red-950/40 border-red-500 text-red-200 shadow-lg shadow-red-900/20' : 'bg-slate-950/50 border-transparent text-slate-400 hover:bg-slate-800'}`}>
                      Yes, a Nightmare
                    </button>
                    <button onClick={() => setFormData({ ...formData, hadNightmare: false })}
                      className={`flex-1 py-4 rounded-xl font-medium border-2 transition-all ${formData.hadNightmare === false ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-900/20' : 'bg-slate-950/50 border-transparent text-slate-400 hover:bg-slate-800'}`}>
                      No, Peaceful Night
                    </button>
                  </div>
                </div>

                {formData.hadNightmare && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-4 border-t border-white/10">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Dream Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-red-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Core Threat <span className="text-slate-500 font-normal ml-1">(One sentence maximum)</span></label>
                      <input type="text" value={formData.coreThreat || ''} onChange={e => setFormData({ ...formData, coreThreat: e.target.value })}
                        placeholder="The dream threatened me by..." 
                        className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-red-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Dominant Emotion</label>
                      <div className="flex flex-wrap gap-2">
                        {['Fear', 'Helplessness', 'Panic', 'Shame', 'Anger', 'Grief'].map(emotion => (
                          <button key={emotion} onClick={() => setFormData({ ...formData, dominantEmotion: emotion })}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.dominantEmotion === emotion ? 'bg-red-600 text-white shadow-md shadow-red-900/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Dream Sign <span className="text-slate-500 font-normal ml-1">(Recurring structural element)</span></label>
                      <input type="text" value={formData.dreamSign || ''} onChange={e => setFormData({ ...formData, dreamSign: e.target.value })}
                        placeholder="e.g., trying to run but legs feel heavy..." 
                        className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-red-500 outline-none transition-all" />
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Intervention Point</label>
                    <input type="text" value={formData.interventionPoint || ''} onChange={e => setFormData({ ...formData, interventionPoint: e.target.value })}
                      placeholder="The exact moment before the threat takes control..."
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mastery Action <span className="text-slate-500 font-normal ml-1">— How will you respond differently?</span></label>
                    <textarea value={formData.masteryAction || ''} onChange={e => setFormData({ ...formData, masteryAction: e.target.value })}
                      placeholder="I recognize this is a dream. I turn, face the threat, and command it to leave in Jesus' name..." rows={3}
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">The Safe Ending</label>
                    <textarea value={formData.safeEnding || ''} onChange={e => setFormData({ ...formData, safeEnding: e.target.value })}
                      placeholder="Rewrite the ending here so it resolves peacefully..." rows={4}
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all resize-none" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Recognition Statement</label>
                    <input type="text" value={formData.recognitionStatement || ''} onChange={e => setFormData({ ...formData, recognitionStatement: e.target.value })}
                      placeholder="In this dream, I learned that I have authority over..."
                      className="w-full bg-slate-950/50 rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-secondary outline-none transition-all" />
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">Spiritual Declaration</label>
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
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4 pt-6 border-t border-white/10 mt-8">
        {currentPhaseIndex > 0 && (
          <button onClick={() => onNextPhase(phases[currentPhaseIndex - 1].id)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
            Back
          </button>
        )}
        <div className="flex-1"></div>
        <button onClick={handleSave} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
          Save Draft
        </button>
        {currentPhaseIndex < phases.length - 1 ? (
          <button onClick={handleNext}
            className="px-8 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-secondary/20 transition-all active:scale-95">
            Next: {phases[currentPhaseIndex + 1].label}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => { handleSave(); onBack(); }}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95">
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
  const [currentView, setCurrentView] = useState<'home' | 'entry'>('home');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  
  const { entries, addOrUpdateEntry, isLoaded } = useJournalEntries();
  const { data: apiStatus } = useModelHealth();

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  const modeEntries = entries.filter(e => e.mode === mode).slice(-7).reverse();
  const timeOfDay = new Date().getHours();
  const isEvening = timeOfDay >= 18 || timeOfDay < 6;

  const startNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode,
      phase: mode === 'vigilant' ? 'presleep' : 'evening',
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 z-[-1] opacity-30 mix-blend-overlay pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/mystic-bg.png)` }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5 shadow-md">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <Moon className={`w-5 h-5 ${mode === 'vigilant' ? 'text-primary' : 'text-secondary'}`} />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-white leading-tight">
                {mode === 'vigilant' ? 'Vigilant Spirit' : 'The Restored Night'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Dream Journal</p>
            </div>
          </div>
          <div className="flex p-1 bg-slate-900 rounded-lg border border-white/5">
            <button
              onClick={() => setMode('vigilant')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'vigilant' ? 'bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Dream
            </button>
            <button
              onClick={() => setMode('restored')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'restored' ? 'bg-slate-800 text-secondary shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Healing
            </button>
          </div>
        </div>
        
        {/* API Status Bar */}
        <div className={`px-5 py-1.5 text-xs flex justify-center items-center font-medium ${apiStatus?.status === 'healthy' ? 'bg-emerald-950/50 text-emerald-400 border-b border-emerald-900/50' : 'bg-amber-950/50 text-amber-400 border-b border-amber-900/50'}`}>
          {apiStatus?.status === 'healthy' 
            ? `✓ Model Online • ${apiStatus.features} features loaded • XAI Ready`
            : '⚠ Using Fallback Local Classification (Model Offline)'}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-5 py-8 pb-24">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Welcome Card */}
              <div className={`rounded-3xl p-8 relative overflow-hidden shadow-2xl border ${
                mode === 'vigilant' 
                  ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900/90 border-indigo-500/20'
                  : 'bg-gradient-to-br from-purple-950/80 to-slate-900/90 border-purple-500/20'
              }`}>
                {/* Decorative elements */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${mode === 'vigilant' ? 'bg-primary' : 'bg-secondary'}`} />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${mode === 'vigilant' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-purple-900/50 text-purple-300'}`}>
                      {isEvening ? <Moon className="w-7 h-7" /> : <Sun className="w-7 h-7" />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-semibold text-white mb-2">
                        {isEvening ? 'Good Evening' : 'Good Morning'}
                      </h2>
                      <p className="text-slate-300 mb-5 leading-relaxed max-w-md">
                        {mode === 'vigilant' 
                          ? isEvening 
                            ? "Prepare your heart for divine communication tonight. Let go of the day's residue."
                            : "Capture your dream immediately. The details fade rapidly as waking life rushes in."
                          : isEvening
                            ? "Complete your evening grounding for safe, restorative sleep."
                            : "If you had a nightmare, process it safely using Image Rehearsal Therapy."
                        }
                      </p>
                      <button
                        onClick={startNewEntry}
                        className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                          mode === 'vigilant' 
                            ? 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90' 
                            : 'bg-secondary text-secondary-foreground shadow-secondary/20 hover:bg-secondary/90'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
                        {isEvening ? 'Begin Evening Ritual' : 'Capture Dream'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scripture Box */}
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:bg-slate-900/60 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-slate-500 to-transparent opacity-50" />
                <p className="text-lg text-slate-200 font-serif italic mb-3">
                  "{SCRIPTURES[mode === 'vigilant' ? 'dreams' : 'protection'][0].text}"
                </p>
                <p className="text-slate-500 text-sm font-medium tracking-wide">— {SCRIPTURES[mode === 'vigilant' ? 'dreams' : 'protection'][0].ref}</p>
              </div>

              {/* Quick Actions (Restored only) */}
              {mode === 'restored' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="bg-red-950/30 border border-red-900/50 rounded-2xl p-5 text-left hover:bg-red-950/50 transition-colors group">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-display font-medium text-red-200 text-lg">3 AM Protocol</h3>
                    <p className="text-sm text-red-200/60 mt-1">Emergency grounding techniques</p>
                  </button>
                  <button className="bg-teal-950/30 border border-teal-900/50 rounded-2xl p-5 text-left hover:bg-teal-950/50 transition-colors group"
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
                      <button
                        key={entry.id}
                        onClick={() => { setCurrentEntry(entry); setCurrentView('entry'); }}
                        className="w-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-5 text-left hover:bg-slate-800 border border-white/5 hover:border-white/10 transition-all flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-medium text-slate-200 text-lg group-hover:text-white transition-colors">{entry.data.title || 'Untitled Session'}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-slate-500 font-medium">
                              {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              entry.phase === 'analysis' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {entry.phase}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 rounded-2xl border border-white/5 border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">No entries yet.</p>
                    <p className="text-sm text-slate-500 mt-1">Start your first journal entry to begin tracking.</p>
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
