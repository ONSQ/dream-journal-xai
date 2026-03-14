import { useState, useEffect, useCallback } from "react";
import type { JournalEntry, XAIResult } from "./lib/types";
import { fetchEntries } from "./lib/api";
import { EntryList } from "./components/EntryList";
import { XAIDetailPanel } from "./components/XAIDetailPanel";
import { SingleClassifier } from "./components/SingleClassifier";
import { BulkInput } from "./components/BulkInput";
import { ReportExport } from "./components/ReportExport";

type Tab = "entries" | "classify" | "bulk";

function App() {
  const [tab, setTab] = useState<Tab>("entries");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [classifyResult, setClassifyResult] = useState<XAIResult | null>(null);
  const [classifyText, setClassifyText] = useState("");

  useEffect(() => {
    fetchEntries()
      .then((data) => {
        setEntries(data);
        const firstWithClassification = data.find((e) => e.data?._classification);
        if (firstWithClassification) setSelectedId(firstWithClassification.clientId);
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : "Failed to load entries");
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedEntry = entries.find((e) => e.clientId === selectedId);
  const selectedClassification = selectedEntry?.data?._classification as XAIResult | undefined;

  const activeResult = tab === "entries" ? selectedClassification ?? null :
                       tab === "classify" ? classifyResult : null;
  const activeText = tab === "classify" ? classifyText :
                     tab === "entries" ? ((selectedEntry?.data?.narrative as string) || "") : "";

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              X
            </div>
            <h1 className="text-base font-bold text-foreground hidden sm:block" style={{ fontFamily: "var(--font-display)" }}>
              XAI Explorer
            </h1>
          </div>
          <nav className="flex items-center gap-1 ml-4">
            <TabButton active={tab === "entries"} onClick={() => setTab("entries")} label="Entries" />
            <TabButton active={tab === "classify"} onClick={() => setTab("classify")} label="Classify" />
            <TabButton active={tab === "bulk"} onClick={() => setTab("bulk")} label="Bulk" />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ReportExport entries={entries} singleResult={activeResult} singleText={activeText} />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {tab === "entries" && (
          <>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden fixed bottom-4 left-4 z-20 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            <aside
              className={`${
                sidebarOpen ? "w-72 md:w-80" : "w-0"
              } border-r border-border bg-card/30 transition-all duration-200 overflow-hidden shrink-0`}
            >
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading entries...</div>
              ) : fetchError ? (
                <div className="p-4 text-sm text-red-400">{fetchError}</div>
              ) : (
                <EntryList entries={entries} selectedId={selectedId} onSelect={handleSelectEntry} />
              )}
            </aside>

            <div className="flex-1 overflow-y-auto" id="xai-report-content">
              {selectedClassification ? (
                <XAIDetailPanel
                  result={selectedClassification}
                  title={(selectedEntry?.data?.title as string) || undefined}
                  narrative={(selectedEntry?.data?.narrative as string) || undefined}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
                      Select an Entry
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {fetchError
                        ? "Could not load entries. Check that the API server is running."
                        : entries.length === 0
                        ? "No entries found. Create journal entries in the main Vigilant Spirit app, then return here to inspect their XAI output."
                        : "Choose an entry from the sidebar to view its full XAI classification breakdown."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "classify" && (
          <div className="flex-1 overflow-hidden" id="xai-report-content">
            <SingleClassifier onResult={(result, text) => { setClassifyResult(result); setClassifyText(text); }} />
          </div>
        )}

        {tab === "bulk" && (
          <div className="flex-1 overflow-hidden">
            <BulkInput />
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export default App;
