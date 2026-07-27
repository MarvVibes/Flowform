import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Share2,
  Copy,
  QrCode,
  Check,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AiGenerateDialog } from "@/components/builder/AiGenerateDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { countResponses, createForm, deleteForm, listForms, type FormRecord } from "@/lib/forms-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your forms — FlowForm" },
      { name: "description", content: "Create, edit and publish your FlowForm forms." },
      { property: "og:title", content: "Your forms — FlowForm" },
      { property: "og:description", content: "Your FlowForm dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Filter = "all" | "live" | "draft";

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [aiOpen, setAiOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [shareForm, setShareForm] = useState<FormRecord | null>(null);

  const formsQuery = useQuery({ queryKey: ["forms"], queryFn: listForms });
  const forms = useMemo(() => formsQuery.data ?? [], [formsQuery.data]);

  const countsQuery = useQuery({
    queryKey: ["response-counts", forms.map((f) => f.id).join(",")],
    queryFn: () => countResponses(forms.map((f) => f.id)),
    enabled: forms.length > 0,
  });

  const counts = countsQuery.data ?? {};
  const totalResponses = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const liveCount = forms.filter((f) => f.published).length;

  const filtered = forms.filter((form) => {
    const matchesQuery = form.title.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "live" ? form.published : !form.published);
    return matchesQuery && matchesFilter;
  });

  const createMutation = useMutation({
    mutationFn: createForm,
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      navigate({ to: "/builder/$id", params: { id: form.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <AppHeader />

      <section className="border-b border-border bg-[#FAF9F6] dark:bg-[#0D131F]">
        <div className="ruled-paper">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <p className="text-[12px] font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase">Workspace</p>
                <h1 className="font-display mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Your Forms</h1>
                <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
                  {forms.length === 0
                    ? "Nothing here yet — start with AI, it's faster than a blank page."
                    : "Everything you're collecting, in one place."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Stat label="Forms" value={forms.length} />
                <Stat label="Live" value={liveCount} />
                <Stat label="Responses" value={totalResponses} />
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search forms..."
                    aria-label="Search forms"
                    className="w-full sm:w-56 bg-card pl-9 rounded-full"
                  />
                </div>
                <div className="flex rounded-full border border-border bg-card p-0.5 shadow-sm">
                  {(["all", "live", "draft"] as Filter[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      aria-pressed={filter === key}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-all",
                        filter === key
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => createMutation.mutate(undefined)}>
                  <Plus className="h-4 w-4" />
                  Blank Form
                </Button>
                <Button className="rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-sm" onClick={() => setAiOpen(true)}>
                  <Sparkles className="h-4 w-4" />
                  Create with AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {formsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasForms={forms.length > 0} onCreate={() => setAiOpen(true)} />
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((form, index) => (
                <FormCard
                  key={form.id}
                  form={form}
                  index={index}
                  responses={counts[form.id] ?? 0}
                  onShare={() => setShareForm(form)}
                  onDelete={() => setPendingDelete({ id: form.id, title: form.title })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <AiGenerateDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        onGenerated={async (result) => {
          const form = await createForm(result);
          queryClient.invalidateQueries({ queryKey: ["forms"] });
          navigate({ to: "/builder/$id", params: { id: form.id } });
        }}
      />

      <ShareDialog form={shareForm} onClose={() => setShareForm(null)} />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the form and every response it collected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 min-w-[90px] sm:min-w-28 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-card px-3 sm:px-5 py-3 sm:py-3.5 shadow-sm text-center">
      <p className="font-display text-xl sm:text-2xl font-bold leading-none text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 dark:text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

function FormCard({
  form,
  index,
  responses,
  onShare,
  onDelete,
}: {
  form: FormRecord;
  index: number;
  responses: number;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.25) }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200 dark:hover:border-sky-400/30"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1 origin-left transition-transform duration-300",
          form.published ? "bg-sky-600" : "bg-slate-200 dark:bg-slate-700",
        )}
      />
      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <Link
            to="/builder/$id"
            params={{ id: form.id }}
            className="font-display text-lg font-bold leading-snug hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          >
            {form.title}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                aria-label={`Actions for ${form.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
              <DropdownMenuItem asChild>
                <Link to="/builder/$id" params={{ id: form.id }}>
                  <Pencil className="h-4 w-4" />
                  Edit Form
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/responses/$id" params={{ id: form.id }}>
                  <BarChart3 className="h-4 w-4" />
                  View Responses
                </Link>
              </DropdownMenuItem>
              {form.published && (
                <>
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                    Share / QR & Embed
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open Live Link
                    </a>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">
          {form.description || `${form.fields.length} question${form.fields.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 border-t pt-4 border-slate-100 dark:border-white/10">
        <Badge variant={form.published ? "default" : "secondary"} className={form.published ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}>
          {form.published ? "Live" : "Draft"}
        </Badge>
        <Link
          to="/responses/$id"
          params={{ id: form.id }}
          className="text-xs font-semibold text-slate-500 dark:text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
        >
          {responses} response{responses === 1 ? "" : "s"}
        </Link>
      </div>
    </motion.article>
  );
}

function ShareDialog({ form, onClose }: { form: FormRecord | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!form) return null;
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${form.slug}` : `/f/${form.slug}`;
  const embedCode = `<iframe src="${fullUrl}" width="100%" height="700px" frameborder="0"></iframe>`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Form link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function copyEmbedSnippet() {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    toast.success("Embed HTML code copied!");
    setTimeout(() => setCopiedEmbed(false), 2000);
  }

  return (
    <Dialog open={Boolean(form)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-sky-600" />
            Share "{form.title}"
          </DialogTitle>
          <DialogDescription>
            Share the live form link, download poster QR code, or embed on your website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Form URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Live Form Link</label>
            <div className="flex gap-2">
              <Input value={fullUrl} readOnly className="rounded-lg font-mono text-xs" />
              <Button size="sm" onClick={copyLink} className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-1.5 text-center p-4 border border-slate-100 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 mb-2">
              <QrCode className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Scannable Poster QR Code
            </label>
            <img src={qrApiUrl} alt="Form QR Code" className="mx-auto h-36 w-36 rounded-lg border shadow-sm" />
            <a
              href={qrApiUrl}
              download={`${form.slug}-qr.png`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
            >
              Download QR Code Image
            </a>
          </div>

          {/* Embed snippet */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Website Embed Code (Iframe)</label>
            <div className="flex gap-2">
              <Input value={embedCode} readOnly className="rounded-lg font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={copyEmbedSnippet} className="rounded-lg shrink-0">
                {copiedEmbed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ hasForms, onCreate }: { hasForms: boolean; onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid-paper rounded-3xl border border-dashed border-slate-300 dark:border-white/15 p-12 text-center bg-white dark:bg-card shadow-sm"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 mb-4">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        {hasForms ? "Nothing matches that search" : "Your first form is one sentence away"}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-muted-foreground">
        {hasForms
          ? "Try a different title or clear the filter."
          : "Describe what you want to ask and FlowForm writes the questions for you."}
      </p>
      {!hasForms && (
        <Button className="mt-6 rounded-full bg-sky-600 hover:bg-sky-700 text-white px-6 shadow-md" onClick={onCreate}>
          <Sparkles className="h-4 w-4" />
          Create with AI
        </Button>
      )}
    </motion.div>
  );
}
