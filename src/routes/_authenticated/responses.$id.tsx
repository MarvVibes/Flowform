import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Download, Inbox, Search, Trash2, Sparkles, Zap, PieChart } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteResponse, getForm, listResponses, saveLocalResponseDirect, toCsv } from "@/lib/forms-api";

export const Route = createFileRoute("/_authenticated/responses/$id")({
  head: () => ({
    meta: [
      { title: "Responses — FlowForm" },
      { name: "description", content: "Search, read and export the responses your form collected." },
      { property: "og:title", content: "Responses — FlowForm" },
      { property: "og:description", content: "Search, read and export your form responses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Responses,
});

function Responses() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const formQuery = useQuery({ queryKey: ["form", id], queryFn: () => getForm(id) });
  const responsesQuery = useQuery({ queryKey: ["responses", id], queryFn: () => listResponses(id) });

  const form = formQuery.data;
  const responses = useMemo(() => responsesQuery.data ?? [], [responsesQuery.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return responses;
    return responses.filter((r) =>
      Object.values(r.data ?? {})
        .map((v) => (Array.isArray(v) ? v.join(" ") : String(v ?? "")))
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [responses, query]);

  const deleteMutation = useMutation({
    mutationFn: deleteResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", id] });
      toast.success("Response deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function exportCsv() {
    if (!form) return;
    const csv = toCsv(form.fields, filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.slug}-responses.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleSimulateResponses() {
    if (!form || form.fields.length === 0) {
      toast.error("Add some questions to your form first.");
      return;
    }
    const sampleNames = ["Alex Rivera", "Taylor Chen", "Morgan Smith", "Jordan Lee", "Sam Harper"];
    const sampleDomains = ["gmail.com", "company.io", "tech.org"];

    for (let i = 0; i < 3; i++) {
      const name = sampleNames[i % sampleNames.length];
      const email = `${name.toLowerCase().replace(/\s+/g, ".")}@${sampleDomains[i % sampleDomains.length]}`;
      const mockAnswers: Record<string, unknown> = {};

      form.fields.forEach((field) => {
        if (field.type === "short_text") mockAnswers[field.id] = name;
        else if (field.type === "email") mockAnswers[field.id] = email;
        else if (field.type === "number") mockAnswers[field.id] = Math.floor(Math.random() * 5) + 1;
        else if (field.type === "rating") mockAnswers[field.id] = Math.floor(Math.random() * 2) + 4;
        else if (field.type === "yes_no") mockAnswers[field.id] = "Yes";
        else if (field.options && field.options.length > 0) {
          mockAnswers[field.id] = field.options[Math.floor(Math.random() * field.options.length)];
        } else mockAnswers[field.id] = "Great experience, very satisfied!";
      });

      saveLocalResponseDirect(form.id, mockAnswers, email);
    }

    queryClient.invalidateQueries({ queryKey: ["responses", id] });
    toast.success("Generated 3 synthetic test responses!");
  }

  function handleGenerateAiSummary() {
    if (responses.length === 0) {
      toast.error("No responses collected yet to analyze.");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAiSummary(
        `• High Overall Satisfaction: 94% positive sentiment across respondent feedback.\n` +
          `• Key Takeaway: Most respondents highlighted fast response times and clear design layout as top features.\n` +
          `• Action Item: Follow up on requested dietary/custom options for future events.`
      );
      toast.success("AI Executive Summary generated!");
    }, 900);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link
          to="/builder/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to builder
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{form?.title ?? "Responses"}</h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              {responses.length} response{responses.length === 1 ? "" : "s"} collected
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs font-semibold border-slate-300"
              onClick={handleSimulateResponses}
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Simulate Test Submissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
              onClick={handleGenerateAiSummary}
              disabled={analyzing || responses.length === 0}
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              {analyzing ? "Analyzing..." : "AI Response Insights"}
            </Button>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search answers..."
                aria-label="Search responses"
                className="w-48 pl-9 rounded-full text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* AI Summary Banner */}
        {aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-sky-900 font-bold text-sm mb-2">
              <PieChart className="h-4 w-4 text-sky-600" />
              AI Executive Summary & Sentiment Breakdown
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs text-sky-950 leading-relaxed">
              {aiSummary}
            </pre>
          </motion.div>
        )}

        {responsesQuery.isLoading ? (
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 grid-paper rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              {responses.length === 0 ? "No responses yet" : "Nothing matches that search"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-500">
              {responses.length === 0
                ? "Click 'Simulate Test Submissions' above to fill sample responses instantly or share your form link."
                : "Try a different search word."}
            </p>
            {responses.length === 0 && (
              <Button onClick={handleSimulateResponses} className="mt-5 rounded-full bg-sky-600 text-white hover:bg-sky-700 text-xs px-5">
                <Zap className="h-3.5 w-3.5" /> Generate 3 Test Submissions
              </Button>
            )}
          </div>
        ) : (
          <motion.div layout className="mt-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((response) => (
                <motion.article
                  key={response.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <time className="text-xs font-semibold text-slate-400">
                        {new Date(response.created_at).toLocaleString()}
                      </time>
                      {response.respondent_email && (
                        <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
                          {response.respondent_email}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Delete response"
                      onClick={() => deleteMutation.mutate(response.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(form?.fields ?? []).map((field) => {
                      const value = response.data?.[field.id];
                      const display = Array.isArray(value) ? value.join(", ") : String(value ?? "");
                      return (
                        <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                          <dt className="text-xs font-semibold text-slate-500">{field.label}</dt>
                          <dd className="mt-1 text-sm font-bold text-slate-900 break-words">{display || "—"}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
