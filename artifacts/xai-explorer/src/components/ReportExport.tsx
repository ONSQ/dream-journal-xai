import { useState, useCallback, useRef } from "react";
import type { XAIResult, Dimension, JournalEntry } from "../lib/types";
import { DIMENSIONS } from "../lib/colors";

interface Props {
  entries: JournalEntry[];
  singleResult?: XAIResult | null;
  singleText?: string;
}

type ExportFormat = "csv" | "json" | "pdf";

export function ReportExport({ entries, singleResult, singleText }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<"all" | "classified" | "single">(singleResult ? "single" : "classified");
  const [exporting, setExporting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(() => dialogRef.current?.showModal(), 0);
  }, []);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
  }, []);

  const getExportData = useCallback(() => {
    if (scope === "single" && singleResult) {
      return [{ text: singleText || "", result: singleResult }];
    }
    const filtered = scope === "classified"
      ? entries.filter((e) => e.data?._classification)
      : entries;
    return filtered.map((e) => ({
      text: (e.data?.narrative as string) || (e.data?.title as string) || "",
      title: (e.data?.title as string) || "",
      mode: e.mode,
      date: e.entryDate,
      result: e.data?._classification as XAIResult | undefined,
    }));
  }, [scope, entries, singleResult, singleText]);

  const exportCSV = useCallback(() => {
    const data = getExportData();
    const headers = [
      "text", "spiritual", "trauma", "maintenance",
      "spiritual_ci_lower", "spiritual_ci_upper",
      "trauma_ci_lower", "trauma_ci_upper",
      "maintenance_ci_lower", "maintenance_ci_upper",
      "source_type", "word_count", "negations",
      "shap_spiritual_top", "shap_trauma_top", "shap_maintenance_top",
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const rows = data.map((d) => {
      const r = d.result;
      if (!r) return [esc(d.text), "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
      return [
        esc(d.text),
        r.probabilities.Spiritual,
        r.probabilities.Trauma,
        r.probabilities.Maintenance,
        r.confidenceIntervals.Spiritual.lower,
        r.confidenceIntervals.Spiritual.upper,
        r.confidenceIntervals.Trauma.lower,
        r.confidenceIntervals.Trauma.upper,
        r.confidenceIntervals.Maintenance.lower,
        r.confidenceIntervals.Maintenance.upper,
        esc(r.sourceType),
        r.wordCount,
        r.negationsDetected,
        esc(r.shap.Spiritual.map((f) => `${f.word}:${f.weight}`).join(";")),
        esc(r.shap.Trauma.map((f) => `${f.word}:${f.weight}`).join(";")),
        esc(r.shap.Maintenance.map((f) => `${f.word}:${f.weight}`).join(";")),
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    download(csv, "xai-report.csv", "text/csv");
  }, [getExportData]);

  const exportJSON = useCallback(() => {
    const data = getExportData();
    const json = JSON.stringify(data, null, 2);
    download(json, "xai-report.json", "application/json");
  }, [getExportData]);

  const exportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = document.getElementById("xai-report-content");
      if (!el) {
        alert("No report content found on page. Navigate to a classification result first.");
        return;
      }
      const canvas = await html2canvas(el, {
        backgroundColor: "#1a1f2e",
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("xai-report.pdf");
    } catch (err) {
      alert("PDF export failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (format === "csv") exportCSV();
    else if (format === "json") exportJSON();
    else exportPDF();
    handleClose();
  }, [format, exportCSV, exportJSON, exportPDF, handleClose]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-sm text-foreground rounded-lg transition-colors border border-border"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>

      {open && (
        <dialog
          ref={dialogRef}
          className="bg-card border border-border rounded-xl shadow-2xl p-0 max-w-md w-full backdrop:bg-black/50"
          onClose={handleClose}
        >
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Export Report
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Scope</label>
              <div className="flex gap-2">
                {singleResult && (
                  <RadioPill active={scope === "single"} onClick={() => setScope("single")} label="Current result" />
                )}
                <RadioPill active={scope === "classified"} onClick={() => setScope("classified")} label="Classified entries" />
                <RadioPill active={scope === "all"} onClick={() => setScope("all")} label="All entries" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Format</label>
              <div className="flex gap-2">
                <RadioPill active={format === "csv"} onClick={() => setFormat("csv")} label="CSV" />
                <RadioPill active={format === "json"} onClick={() => setFormat("json")} label="JSON" />
                <RadioPill active={format === "pdf"} onClick={() => setFormat("pdf")} label="PDF" />
              </div>
              {format === "pdf" && (
                <p className="text-xs text-amber-400">
                  PDF captures the currently visible XAI detail panel as an image.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Download"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

function RadioPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
        active
          ? "bg-primary/15 text-primary border-primary/30"
          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
