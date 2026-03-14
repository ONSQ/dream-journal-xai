import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useListEntries, useClassifyDream } from "@workspace/api-client-react";
import type { XAIResult, JournalEntry } from "./lib/types";
import { EntryList } from "./components/EntryList";
import { XAIDetailPanel } from "./components/XAIDetailPanel";
import { SingleClassifier } from "./components/SingleClassifier";
import { BulkInput } from "./components/BulkInput";
import { ReportExport } from "./components/ReportExport";

const queryClient = new QueryClient();

type Tab = "entries" | "classify" | "bulk";

function AppContent() {
  const [tab, setTab] = useState<Tab>("entries");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [classifyResult, setClassifyResult] = useState<XAIResult | null>(null);
  const [classifyText, setClassifyText] = useState("");

  const { data: entriesData, isLoading, error: fetchError } = useListEntries();
  const entries = (entriesData?.entries ?? []) as JournalEntry[];

  const firstClassified = entries.find((e) => e.data?._classification);
  const effectiveSelectedId = selectedId ?? firstClassified?.clientId ?? null;

  const selectedEntry = entries.find((e) => e.clientId === effectiveSelectedId);
  const selectedClassification = selectedEntry?.data?._classification as XAIResult | undefined;

  const activeResult = tab === "entries" ? selectedClassification ?? null :
                       tab === "classify" ? classifyResult : null;
  const activeText = tab === "classify" ? classifyText :
                     tab === "entries" ? ((selectedEntry?.data?.narrative as string) || "") : "";

  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const handleSelectEntry = useCallback((id: string) => {
    setSelectedId(id);
    setMobileView("detail");
  }, []);

  const handleBackToList = useCallback(() => {
    setMobileView("list");
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
            <aside
              className={`hidden md:block w-80 border-r border-border bg-card/30 overflow-hidden shrink-0`}
            >
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading entries...</div>
              ) : fetchError ? (
                <div className="p-4 text-sm text-red-400">
                  {fetchError instanceof Error ? fetchError.message : "Failed to load entries"}
                </div>
              ) : (
                <EntryList entries={entries} selectedId={effectiveSelectedId} onSelect={handleSelectEntry} />
              )}
            </aside>

            <div className="hidden md:flex flex-1 overflow-y-auto" id="xai-report-content">
              {selectedClassification ? (
                <div className="flex-1">
                  <XAIDetailPanel
                    result={selectedClassification}
                    title={(selectedEntry?.data?.title as string) || undefined}
                    narrative={(selectedEntry?.data?.narrative as string) || undefined}
                  />
                </div>
              ) : (
                <EmptyState entries={entries} fetchError={fetchError} />
              )}
            </div>

            <div className="md:hidden flex-1 overflow-hidden">
              {mobileView === "list" ? (
                <div className="h-full overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading entries...</div>
                  ) : fetchError ? (
                    <div className="p-4 text-sm text-red-400">
                      {fetchError instanceof Error ? fetchError.message : "Failed to load entries"}
                    </div>
                  ) : (
                    <EntryList entries={entries} selectedId={effectiveSelectedId} onSelect={handleSelectEntry} />
                  )}
                </div>
              ) : (
                <div className="h-full overflow-y-auto" id="xai-report-content-mobile">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1 px-4 py-3 text-sm text-primary hover:text-primary/80 transition-colors sticky top-0 bg-background/90 backdrop-blur-sm z-10 border-b border-border"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to entries
                  </button>
                  {selectedClassification ? (
                    <XAIDetailPanel
                      result={selectedClassification}
                      title={(selectedEntry?.data?.title as string) || undefined}
                      narrative={(selectedEntry?.data?.narrative as string) || undefined}
                    />
                  ) : (
                    <EmptyState entries={entries} fetchError={fetchError} />
                  )}
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

function EmptyState({ entries, fetchError }: { entries: JournalEntry[]; fetchError: Error | null }) {
  return (
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
