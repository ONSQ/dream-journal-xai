import React, { useState, useEffect } from 'react';
import { Moon, Sun, BookOpen, Shield, Brain, Heart, ChevronRight, ChevronDown, Clock, Sparkles, AlertTriangle, Check, X, Plus, Calendar, TrendingUp, Eye, Zap, Loader2 } from 'lucide-react';

// Scripture data
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

// Source interpretations (fallback if API doesn't return them)
const SOURCE_INTERPRETATIONS = {
  spiritual_dominant: { title: "Potentially Divine Communication", icon: "✨", color: "indigo", guidance: "Apply the Discernment Checklist: Does it align with Scripture? Does it produce peace?" },
  trauma_dominant: { title: "Trauma Processing / Threat Simulation", icon: "⚠️", color: "red", guidance: "Consider using IRT to rewrite this dream with a safe ending." },
  maintenance_dominant: { title: "Biological Processing", icon: "🧠", color: "green", guidance: "Standard maintenance dream. No special action required." },
  mixed_spiritual_trauma: { title: "Spiritual Warfare / Shadow Work", icon: "⚔️", color: "purple", guidance: "This may represent spiritual warfare or areas requiring healing." },
  mixed_all: { title: "Complex Multi-Dimensional Dream", icon: "🔮", color: "slate", guidance: "Apply careful discernment." }
};

// API Functions - Call the real Python backend
async function classifyDreamAPI(allText) {
  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: allText })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Classification failed');
    }
    
    // Transform API response to match expected format
    return {
      probabilities: {
        spiritual: data.probabilities.Spiritual,
        trauma: data.probabilities.Trauma,
        maintenance: data.probabilities.Maintenance
      },
      shap: {
        spiritual: data.shap.Spiritual || [],
        trauma: data.shap.Trauma || [],
        maintenance: data.shap.Maintenance || []
      },
      lime: {
        spiritual: data.lime.Spiritual || [],
        trauma: data.lime.Trauma || [],
        maintenance: data.lime.Maintenance || []
      },
      agreement: {
        spiritual: data.agreement.Spiritual || 0,
        trauma: data.agreement.Trauma || 0,
        maintenance: data.agreement.Maintenance || 0
      },
      sourceType: data.sourceType,
      sourceInfo: data.sourceInfo,
      interpretation: data.interpretation,
      dimensionInterpretations: data.dimensionInterpretations,
      wordCount: data.wordCount
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function checkAPIHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return data;
  } catch (error) {
    return { status: 'unavailable', error: error.message };
  }
}

// XAI Clearbox Component
function ClearboxAnalysis({ classification, entryData, mode, isLoading, error }) {
  const [expandedDim, setExpandedDim] = useState(null);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-300">Analyzing dream with SHAP + LIME...</p>
        <p className="text-slate-500 text-sm mt-2">Running real XAI classification</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-200 mb-2">Classification Error</h3>
            <p className="text-slate-300 text-sm">{error}</p>
            <p className="text-slate-500 text-xs mt-2">The API server may not be running. Check the console.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!classification) return null;
  
  const sourceInfo = classification.sourceInfo || SOURCE_INTERPRETATIONS[classification.sourceType] || SOURCE_INTERPRETATIONS.mixed_all;
  
  const getDimColor = (dim) => {
    if (dim === 'spiritual') return 'indigo';
    if (dim === 'trauma') return 'red';
    return 'green';
  };

  return (
    <div className="space-y-6">
      {/* Real XAI Badge */}
      <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3">
        <Zap className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="text-emerald-200 text-sm font-medium">Real XAI Classification</p>
          <p className="text-emerald-400/70 text-xs">Powered by scikit-learn + SHAP + LIME</p>
        </div>
      </div>

      {/* Source Header */}
      <div className={`bg-${sourceInfo.color || 'slate'}-900/30 border border-${sourceInfo.color || 'slate'}-500/30 rounded-2xl p-6`}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">{sourceInfo.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{sourceInfo.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{sourceInfo.guidance}</p>
          </div>
        </div>
      </div>

      {/* Classification Summary */}
      <div className="bg-slate-800/50 rounded-xl p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          Classification Overview
        </h4>
        <div className="space-y-4">
          {['spiritual', 'trauma', 'maintenance'].map(dim => {
            const prob = classification.probabilities[dim];
            const color = getDimColor(dim);
            const isExpanded = expandedDim === dim;
            
            return (
              <div key={dim} className="space-y-2">
                <button onClick={() => setExpandedDim(isExpanded ? null : dim)} className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize flex items-center gap-2">
                      {dim}
                      {prob > 0.5 && <Check className="w-4 h-4 text-green-400" />}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                    <span className={`font-mono ${prob > 0.5 ? `text-${color}-400` : 'text-slate-500'}`}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        dim === 'spiritual' ? 'bg-gradient-to-r from-indigo-600 to-purple-500' : 
                        dim === 'trauma' ? 'bg-gradient-to-r from-red-600 to-orange-500' : 
                        'bg-gradient-to-r from-green-600 to-emerald-500'
                      }`}
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="mt-3 p-4 bg-slate-700/50 rounded-lg space-y-4 animate-in">
                    {/* Dimension Interpretation */}
                    {classification.dimensionInterpretations && (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {classification.dimensionInterpretations[dim.charAt(0).toUpperCase() + dim.slice(1)]}
                      </p>
                    )}
                    
                    {/* SHAP Features */}
                    <div>
                      <h5 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        SHAP Analysis (Shapley Values)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {classification.shap[dim]?.length > 0 ? (
                          classification.shap[dim].map((f, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-900/30 border border-emerald-500/30 rounded text-xs">
                              "{f.word}" 
                              <span className={`ml-1 ${f.weight > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {f.weight > 0 ? '+' : ''}{f.weight.toFixed(2)}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No significant features detected</span>
                        )}
                      </div>
                    </div>
                    
                    {/* LIME Features */}
                    <div>
                      <h5 className="text-xs font-semibold text-orange-400 mb-2 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        LIME Analysis (Local Surrogate)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {classification.lime[dim]?.length > 0 ? (
                          classification.lime[dim].map((f, i) => (
                            <span key={i} className="px-2 py-1 bg-orange-900/30 border border-orange-500/30 rounded text-xs">
                              "{f.word}" 
                              <span className={`ml-1 ${f.weight > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                                {f.weight > 0 ? '+' : ''}{f.weight.toFixed(2)}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No significant features detected</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Method Agreement */}
                    <div className="pt-2 border-t border-slate-600">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">SHAP ↔ LIME Agreement</span>
                        <span className={`font-medium ${classification.agreement[dim] > 0.6 ? 'text-green-400' : 'text-amber-400'}`}>
                          {(classification.agreement[dim] * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Summary */}
      <div className="bg-slate-800/50 rounded-xl p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          Analysis Input Summary
        </h4>
        <div className="text-sm text-slate-400 space-y-1">
          <p>Words analyzed: <span className="text-white">{classification.wordCount}</span></p>
          <p>Entry fields included:</p>
          <ul className="list-disc list-inside ml-2 text-xs">
            {entryData.narrative && <li>Dream narrative</li>}
            {entryData.title && <li>Dream title</li>}
            {entryData.incubationRequest && <li>Incubation request</li>}
            {entryData.theme && <li>Theme</li>}
            {entryData.affect && <li>Affect/emotions</li>}
            {entryData.interpretation && <li>Interpretation notes</li>}
            {entryData.coreThreat && <li>Core threat</li>}
            {entryData.masteryAction && <li>Mastery action</li>}
            {entryData.safeEnding && <li>Safe ending</li>}
          </ul>
        </div>
      </div>

      {/* Final Interpretation */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/10">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Final Interpretation
        </h4>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-slate-300 leading-relaxed">{classification.interpretation}</p>
        </div>
        
        {/* Confidence Note */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-500">
            <strong>Model Info:</strong> Multi-label classifier (F1: Spiritual=0.89, Trauma=0.88, Maintenance=0.79). 
            Explanations via SHAP (Shapley values) and LIME (local surrogate). 
            Machine learning aids discernment but does not replace it.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to collect all text from entry for classification
function collectAllEntryText(data) {
  const fields = [
    data.title, data.narrative, data.incubationRequest, data.theme,
    data.affect, data.question, data.interpretation, data.coreThreat,
    data.dominantEmotion, data.dreamSign, data.masteryAction,
    data.safeEnding, data.interventionPoint, data.recognitionStatement, data.concerns
  ];
  return fields.filter(Boolean).join(' ');
}

// Main App Component
export default function DreamJournalApp() {
  const [mode, setMode] = useState('vigilant');
  const [currentView, setCurrentView] = useState('home');
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  
  useEffect(() => {
    // Check API health on load
    checkAPIHealth().then(setApiStatus);
    
    // Load entries from localStorage
    try {
      const saved = localStorage.getItem('dream-entries');
      if (saved) setEntries(JSON.parse(saved));
    } catch (e) {
      console.log('No saved entries');
    }
  }, []);
  
  const saveEntries = (newEntries) => {
    setEntries(newEntries);
    localStorage.setItem('dream-entries', JSON.stringify(newEntries));
  };

  const startNewEntry = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode: mode,
      phase: mode === 'vigilant' ? 'presleep' : 'evening',
      data: {}
    };
    setCurrentEntry(newEntry);
    setCurrentView('entry');
  };

  const saveEntry = (entryData) => {
    const updatedEntry = { ...currentEntry, data: { ...currentEntry.data, ...entryData } };
    const existingIndex = entries.findIndex(e => e.id === updatedEntry.id);
    const newEntries = existingIndex >= 0 
      ? entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
      : [...entries, updatedEntry];
    saveEntries(newEntries);
    setCurrentEntry(updatedEntry);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-6 h-6 text-indigo-400" />
            <h1 className="text-lg font-semibold">
              {mode === 'vigilant' ? 'Vigilant Spirit' : 'The Restored Night'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('vigilant')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'vigilant' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              Dream
            </button>
            <button
              onClick={() => setMode('restored')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'restored' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1" />
              Healing
            </button>
          </div>
        </div>
        
        {/* API Status Bar */}
        {apiStatus && (
          <div className={`px-4 py-1 text-xs ${apiStatus.status === 'healthy' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300'}`}>
            {apiStatus.status === 'healthy' 
              ? `✓ XAI API Online • Model: ${apiStatus.features} features • SHAP: ${apiStatus.shap_available ? '✓' : '✗'} • LIME: ${apiStatus.lime_available ? '✓' : '✗'}`
              : '⚠ XAI API Offline - Classification unavailable'}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {currentView === 'home' && (
          <HomeView 
            mode={mode} 
            entries={entries} 
            onNewEntry={startNewEntry}
            onViewEntry={(entry) => { setCurrentEntry(entry); setCurrentView('entry'); }}
          />
        )}
        
        {currentView === 'entry' && currentEntry && (
          mode === 'vigilant' ? (
            <VigilantEntry 
              entry={currentEntry}
              onSave={saveEntry}
              onBack={() => setCurrentView('home')}
              onNextPhase={(phase) => setCurrentEntry({...currentEntry, phase})}
            />
          ) : (
            <RestoredEntry
              entry={currentEntry}
              onSave={saveEntry}
              onBack={() => setCurrentView('home')}
              onNextPhase={(phase) => setCurrentEntry({...currentEntry, phase})}
            />
          )
        )}
      </main>
    </div>
  );
}

// Home View
function HomeView({ mode, entries, onNewEntry, onViewEntry }) {
  const modeEntries = entries.filter(e => e.mode === mode).slice(-7).reverse();
  const timeOfDay = new Date().getHours();
  const isEvening = timeOfDay >= 18 || timeOfDay < 6;
  
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className={`rounded-2xl p-6 ${
        mode === 'vigilant' 
          ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20'
          : 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20'
      }`}>
        <div className="flex items-start gap-4">
          {isEvening ? <Moon className="w-10 h-10 text-indigo-300" /> : <Sun className="w-10 h-10 text-amber-300" />}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {isEvening ? 'Good Evening' : 'Good Morning'}
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              {mode === 'vigilant' 
                ? isEvening 
                  ? "Prepare your heart for divine communication tonight."
                  : "Capture your dream immediately. 95% fades within minutes."
                : isEvening
                  ? "Complete your evening grounding for safe sleep."
                  : "If you had a nightmare, capture only the core threat."
              }
            </p>
            <button
              onClick={onNewEntry}
              className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                mode === 'vigilant' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              <Plus className="w-5 h-5" />
              {isEvening ? 'Begin Evening Ritual' : 'Capture Dream'}
            </button>
          </div>
        </div>
      </div>

      {/* Scripture */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-white/5">
        <p className="text-indigo-200 italic mb-2">
          "{SCRIPTURES[mode === 'vigilant' ? 'dreams' : 'protection'][0].text}"
        </p>
        <p className="text-slate-400 text-sm">— {SCRIPTURES[mode === 'vigilant' ? 'dreams' : 'protection'][0].ref}</p>
      </div>

      {/* Quick Actions for Restored */}
      {mode === 'restored' && (
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-left hover:bg-red-900/50">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
            <h3 className="font-medium text-red-200">3 AM Protocol</h3>
            <p className="text-xs text-slate-400 mt-1">Emergency grounding</p>
          </button>
          <button className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 text-left hover:bg-blue-900/50">
            <Heart className="w-6 h-6 text-blue-400 mb-2" />
            <h3 className="font-medium text-blue-200">4-4-6 Breathing</h3>
            <p className="text-xs text-slate-400 mt-1">Regulate your body</p>
          </button>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Recent Entries
        </h3>
        {modeEntries.length > 0 ? (
          <div className="space-y-2">
            {modeEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => onViewEntry(entry)}
                className="w-full bg-slate-800/50 rounded-xl p-4 text-left hover:bg-slate-800 border border-white/5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{entry.data.title || 'Untitled Dream'}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No entries yet. Start your first entry above.</p>
        )}
      </div>
    </div>
  );
}

// Vigilant Spirit Entry Component
function VigilantEntry({ entry, onSave, onBack, onNextPhase }) {
  const [formData, setFormData] = useState(entry.data || {});
  const [classification, setClassification] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState(null);
  
  const phases = [
    { id: 'presleep', label: 'Pre-Sleep', icon: Moon },
    { id: 'capture', label: 'Capture', icon: BookOpen },
    { id: 'response', label: 'Response', icon: Heart },
    { id: 'analysis', label: 'Analysis', icon: Brain },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.id === entry.phase);

  // Auto-classify when entering analysis phase
  useEffect(() => {
    if (entry.phase === 'analysis' && !classification && !isClassifying) {
      const allText = collectAllEntryText(formData);
      if (allText.length > 10) {
        setIsClassifying(true);
        setClassifyError(null);
        classifyDreamAPI(allText)
          .then(result => {
            setClassification(result);
            setIsClassifying(false);
          })
          .catch(err => {
            setClassifyError(err.message);
            setIsClassifying(false);
          });
      }
    }
  }, [entry.phase, formData]);

  const handleSave = () => { onSave(formData); };
  const handleNext = () => {
    handleSave();
    if (currentPhaseIndex < phases.length - 1) {
      onNextPhase(phases[currentPhaseIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-1">
          {phases.map((phase, i) => (
            <div key={phase.id} className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentPhaseIndex ? 'bg-indigo-500' : 'bg-slate-700'}`} />
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-2">{currentPhaseIndex + 1}/{phases.length}</span>
      </div>

      {/* Phase 1: Pre-Sleep */}
      {entry.phase === 'presleep' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-400" />
            Pre-Sleep Preparation
          </h2>
          
          <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input type="date" value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Physical State</label>
              <select value={formData.physicalState || ''} onChange={e => setFormData({ ...formData, physicalState: e.target.value })}
                className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600">
                <option value="">Select...</option>
                <option value="rested">Well-rested</option>
                <option value="tired">Tired</option>
                <option value="stressed">Stressed</option>
                <option value="ill">Ill/Medicated</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Incubation Request <span className="text-slate-500 font-normal">— What question do you bring before God?</span>
              </label>
              <textarea value={formData.incubationRequest || ''} onChange={e => setFormData({ ...formData, incubationRequest: e.target.value })}
                placeholder="Lord, show me..." rows={3}
                className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
            </div>
          </div>

          <div className="bg-indigo-900/30 rounded-xl p-5 border border-indigo-500/20">
            <h3 className="font-medium text-indigo-200 mb-2">Prayer of Protection</h3>
            <p className="text-sm text-slate-300 italic">
              "Lord, I commit my sleep to You. Guard my mind against deception. Open my spirit to hear Your voice. 
              Give me wisdom to discern what You reveal. In Jesus' name, Amen."
            </p>
          </div>
        </div>
      )}

      {/* Phase 2: Capture */}
      {entry.phase === 'capture' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Dream Capture
          </h2>
          
          <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-500/20">
            <p className="text-amber-200 text-sm">⚡ Write immediately upon waking. 95% of dream memory fades within minutes.</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Dream Title</label>
              <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give this dream a name..." className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Narrative <span className="text-slate-500 font-normal">— Write in present tense</span>
              </label>
              <textarea value={formData.narrative || ''} onChange={e => setFormData({ ...formData, narrative: e.target.value })}
                placeholder="I am standing in... I see... I feel..." rows={8}
                className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vivid Details Present</label>
              <div className="flex flex-wrap gap-3">
                {['Vivid Colors', 'Spoken Words', 'Strong Sensations', 'Unusual Clarity'].map(detail => (
                  <label key={detail} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.vividDetails?.includes(detail) || false}
                      onChange={e => {
                        const details = formData.vividDetails || [];
                        setFormData({ ...formData, vividDetails: e.target.checked ? [...details, detail] : details.filter(d => d !== detail) });
                      }}
                      className="rounded bg-slate-700 border-slate-600" />
                    {detail}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Response */}
      {entry.phase === 'response' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-indigo-400" />
            Response & Discernment
          </h2>

          <div className="bg-slate-800/50 rounded-xl p-5">
            <h3 className="font-medium mb-4">Source Test</h3>
            <div className="space-y-3">
              {[
                { id: 'biological', label: 'Processing / Biological', desc: 'Fragmented, day residue' },
                { id: 'psychological', label: 'Psychological / Shadow', desc: 'Fear, repressed desire' },
                { id: 'spiritual', label: 'Spiritual / Message', desc: 'Vivid, coherent, lasting peace' },
              ].map(source => (
                <label key={source.id} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700">
                  <input type="radio" name="sourceTest" value={source.id} checked={formData.sourceTest === source.id}
                    onChange={e => setFormData({ ...formData, sourceTest: e.target.value })} className="mt-1" />
                  <div>
                    <p className="font-medium text-sm">{source.label}</p>
                    <p className="text-xs text-slate-400">{source.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
            <h3 className="font-medium">T-TAQ Analysis</h3>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Theme: Central conflict?</label>
              <input type="text" value={formData.theme || ''} onChange={e => setFormData({ ...formData, theme: e.target.value })}
                className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Affect: What did I feel?</label>
              <input type="text" value={formData.affect || ''} onChange={e => setFormData({ ...formData, affect: e.target.value })}
                className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Question: What does this ask of my waking life?</label>
              <input type="text" value={formData.question || ''} onChange={e => setFormData({ ...formData, question: e.target.value })}
                className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5">
            <h3 className="font-medium mb-4">Emotional Fruit</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setFormData({ ...formData, emotionalFruit: 'consolation' })}
                className={`p-4 rounded-lg border text-left ${formData.emotionalFruit === 'consolation' ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-700/50 border-slate-600'}`}>
                <h4 className="font-medium text-green-300 mb-1">Consolation</h4>
                <p className="text-xs text-slate-400">Peace, faith, hope, love</p>
              </button>
              <button onClick={() => setFormData({ ...formData, emotionalFruit: 'desolation' })}
                className={`p-4 rounded-lg border text-left ${formData.emotionalFruit === 'desolation' ? 'bg-red-900/30 border-red-500/50' : 'bg-slate-700/50 border-slate-600'}`}>
                <h4 className="font-medium text-red-300 mb-1">Desolation</h4>
                <p className="text-xs text-slate-400">Fear, confusion, anxiety</p>
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">What is God showing me?</label>
            <textarea value={formData.interpretation || ''} onChange={e => setFormData({ ...formData, interpretation: e.target.value })}
              rows={4} className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
          </div>
        </div>
      )}

      {/* Phase 4: Analysis (Real XAI) */}
      {entry.phase === 'analysis' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            Dream Analysis — Clearbox XAI
          </h2>

          <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
            <p className="text-blue-200 text-sm">
              Your complete dream entry is being analyzed by the trained ML model with SHAP and LIME explainability.
            </p>
          </div>

          <ClearboxAnalysis 
            classification={classification}
            entryData={formData}
            mode="vigilant"
            isLoading={isClassifying}
            error={classifyError}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {currentPhaseIndex > 0 && (
          <button onClick={() => onNextPhase(phases[currentPhaseIndex - 1].id)}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium">Previous</button>
        )}
        <button onClick={handleSave} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium">Save</button>
        {currentPhaseIndex < phases.length - 1 ? (
          <button onClick={handleNext}
            className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium flex items-center justify-center gap-2">
            Next: {phases[currentPhaseIndex + 1].label}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => { handleSave(); onBack(); }}
            className="flex-1 px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-medium flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Complete Entry
          </button>
        )}
      </div>
    </div>
  );
}

// Restored Night Entry Component
function RestoredEntry({ entry, onSave, onBack, onNextPhase }) {
  const [formData, setFormData] = useState(entry.data || {});
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [classification, setClassification] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState(null);

  const phases = [
    { id: 'evening', label: 'Evening', icon: Moon },
    { id: 'witness', label: 'Witness', icon: BookOpen },
    { id: 'restoration', label: 'Restoration', icon: Heart },
    { id: 'release', label: 'Release', icon: Sparkles },
    { id: 'analysis', label: 'Analysis', icon: Brain },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.id === entry.phase);

  // Breathing exercise
  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setBreathCount(prev => {
        if (prev <= 1) {
          setBreathPhase(p => p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale');
          return breathPhase === 'exhale' ? 4 : breathPhase === 'hold' ? 4 : 6;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  // Auto-classify when entering analysis phase
  useEffect(() => {
    if (entry.phase === 'analysis' && !classification && !isClassifying) {
      const allText = collectAllEntryText(formData);
      if (allText.length > 10) {
        setIsClassifying(true);
        setClassifyError(null);
        classifyDreamAPI(allText)
          .then(result => {
            setClassification(result);
            setIsClassifying(false);
          })
          .catch(err => {
            setClassifyError(err.message);
            setIsClassifying(false);
          });
      }
    }
  }, [entry.phase, formData]);

  const handleSave = () => { onSave(formData); };
  const handleNext = () => {
    handleSave();
    if (currentPhaseIndex < phases.length - 1) {
      onNextPhase(phases[currentPhaseIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-1">
          {phases.map((phase, i) => (
            <div key={phase.id} className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentPhaseIndex ? 'bg-purple-500' : 'bg-slate-700'}`} />
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-2">{currentPhaseIndex + 1}/{phases.length}</span>
      </div>

      {/* Phase 1: Evening Grounding */}
      {entry.phase === 'evening' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Moon className="w-6 h-6 text-purple-400" />
            Phase 1: Evening Grounding
          </h2>

          <div className="bg-slate-800/50 rounded-xl p-5">
            <h3 className="font-medium mb-4">4-4-6 Breathing</h3>
            <div className="text-center py-6">
              <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-1000 ${
                breathPhase === 'inhale' ? 'bg-blue-500/30 scale-110' : 
                breathPhase === 'hold' ? 'bg-purple-500/30 scale-100' : 'bg-green-500/30 scale-90'
              }`}>
                {breathCount}
              </div>
              <p className="mt-3 text-lg capitalize text-slate-300">{breathPhase}</p>
              <button onClick={() => setBreathingActive(!breathingActive)}
                className={`mt-3 px-5 py-2 rounded-xl font-medium ${breathingActive ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                {breathingActive ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Stress Level (1-10)</label>
                <input type="range" min="1" max="10" value={formData.stressLevel || 5}
                  onChange={e => setFormData({ ...formData, stressLevel: e.target.value })} className="w-full" />
                <div className="text-center text-lg font-bold text-purple-400">{formData.stressLevel || 5}</div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Physical State</label>
                <select value={formData.physicalState || ''} onChange={e => setFormData({ ...formData, physicalState: e.target.value })}
                  className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600">
                  <option value="">Select...</option>
                  <option value="tense">Tense</option>
                  <option value="tired">Exhausted</option>
                  <option value="okay">Manageable</option>
                  <option value="calm">Calm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Release today's concerns</label>
              <textarea value={formData.concerns || ''} onChange={e => setFormData({ ...formData, concerns: e.target.value })}
                placeholder="Write them down and let them go..." rows={3}
                className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: The Witness */}
      {entry.phase === 'witness' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Phase 2: The Witness
          </h2>

          <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-500/20">
            <p className="text-amber-200 text-sm">⚠️ <strong>Do Not Relive</strong> — Capture only the Core Threat in one sentence.</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Did you have a nightmare?</label>
              <div className="flex gap-3">
                <button onClick={() => setFormData({ ...formData, hadNightmare: true })}
                  className={`flex-1 py-3 rounded-lg font-medium ${formData.hadNightmare === true ? 'bg-red-600' : 'bg-slate-700'}`}>Yes</button>
                <button onClick={() => setFormData({ ...formData, hadNightmare: false })}
                  className={`flex-1 py-3 rounded-lg font-medium ${formData.hadNightmare === false ? 'bg-green-600' : 'bg-slate-700'}`}>No (Peaceful Night)</button>
              </div>
            </div>

            {formData.hadNightmare && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dream Title</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Core Threat (One sentence)</label>
                  <input type="text" value={formData.coreThreat || ''} onChange={e => setFormData({ ...formData, coreThreat: e.target.value })}
                    placeholder="The dream threatened me by..." className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dominant Emotion</label>
                  <div className="flex flex-wrap gap-2">
                    {['Fear', 'Helplessness', 'Panic', 'Shame', 'Anger', 'Grief'].map(emotion => (
                      <button key={emotion} onClick={() => setFormData({ ...formData, dominantEmotion: emotion })}
                        className={`px-4 py-2 rounded-lg text-sm ${formData.dominantEmotion === emotion ? 'bg-red-600' : 'bg-slate-700'}`}>{emotion}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dream Sign (Recurring element)</label>
                  <input type="text" value={formData.dreamSign || ''} onChange={e => setFormData({ ...formData, dreamSign: e.target.value })}
                    placeholder="e.g., can't run, faceless figure..." className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
                </div>
              </>
            )}

            {formData.hadNightmare === false && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-300 mb-2">Peaceful Night</h3>
                <p className="text-slate-400">Celebrate this victory.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 3: Restoration */}
      {entry.phase === 'restoration' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-purple-400" />
            Phase 3: Restoration (IRT)
          </h2>

          {formData.hadNightmare === false ? (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center">
              <p className="text-slate-400">No nightmare to restore. Skip to Release.</p>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              {formData.coreThreat && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Core Threat:</p>
                  <p className="text-white">{formData.coreThreat}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Intervention Point</label>
                <input type="text" value={formData.interventionPoint || ''} onChange={e => setFormData({ ...formData, interventionPoint: e.target.value })}
                  placeholder="The moment before the threat takes control..."
                  className="w-full bg-slate-700 rounded-lg px-4 py-2.5 text-white border border-slate-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mastery Action</label>
                <textarea value={formData.masteryAction || ''} onChange={e => setFormData({ ...formData, masteryAction: e.target.value })}
                  placeholder="I recognize this is a dream. I turn and face the threat..." rows={3}
                  className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Safe Ending (present tense)</label>
                <textarea value={formData.safeEnding || ''} onChange={e => setFormData({ ...formData, safeEnding: e.target.value })}
                  placeholder="The threat dissolves. I am surrounded by light..." rows={4}
                  className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase 4: Release */}
      {entry.phase === 'release' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Phase 4: Release (Rehearsal)
          </h2>

          <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
            {formData.safeEnding && (
              <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-300 mb-1">Your Safe Ending:</p>
                <p className="text-white italic">{formData.safeEnding}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Rehearsal Checklist</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.rehearsal1 || false}
                    onChange={e => setFormData({ ...formData, rehearsal1: e.target.checked })}
                    className="rounded bg-slate-700 border-slate-600" />
                  Morning Visualization (5 min)
                </label>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.rehearsal2 || false}
                    onChange={e => setFormData({ ...formData, rehearsal2: e.target.checked })}
                    className="rounded bg-slate-700 border-slate-600" />
                  Evening Visualization (5 min)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Recognition Statement</label>
              <textarea value={formData.recognitionStatement || 'This is my Dream Sign. I am dreaming. I am safe. Now I act.'}
                onChange={e => setFormData({ ...formData, recognitionStatement: e.target.value })} rows={2}
                className="w-full bg-slate-700 rounded-lg px-4 py-3 text-white border border-slate-600 resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* Phase 5: Analysis (Real XAI) */}
      {entry.phase === 'analysis' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Dream Analysis — Clearbox XAI
          </h2>

          <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-200 text-sm">
              Your complete entry is being analyzed by the trained ML model with SHAP and LIME.
            </p>
          </div>

          <ClearboxAnalysis 
            classification={classification}
            entryData={formData}
            mode="restored"
            isLoading={isClassifying}
            error={classifyError}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {currentPhaseIndex > 0 && (
          <button onClick={() => onNextPhase(phases[currentPhaseIndex - 1].id)}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium">Previous</button>
        )}
        <button onClick={handleSave} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium">Save</button>
        {currentPhaseIndex < phases.length - 1 ? (
          <button onClick={handleNext}
            className="flex-1 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium flex items-center justify-center gap-2">
            Next: {phases[currentPhaseIndex + 1].label}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => { handleSave(); onBack(); }}
            className="flex-1 px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl font-medium flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Complete Entry
          </button>
        )}
      </div>
    </div>
  );
}
