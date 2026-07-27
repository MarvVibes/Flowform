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
  FileText,
  TrendingUp,
  Zap,
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
    <div className="min-h-screen bg-[#07070C]">
      <AppHeader />

      {/* Dashboard Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        {/* Subtle ambient gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-0 h-[300px] w-[400px] rounded-full bg-violet-600/8 blur-[80px]" />
          <div className="absolute top-0 right-0 h-[200px] w-[300px] rounded-full bg-sky-600/6 blur-[60px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-widest text-violet-400 uppercase flex items-center gap-1.5">
                <Zap className="h-3 w-3" /> Workspace
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Your Forms
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/45">
                {forms.length === 0
                  ? "Nothing here yet — start with AI, it's faster than a blank page."
                  : "Everything you're collecting, in one place."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatCard label="Forms" value={forms.length} icon={FileText} color="violet" />
              <StatCard label="Live" value={liveCount} icon={TrendingUp} color="emerald" />
              <StatCard label="Responses" value={totalResponses} icon={BarChart3} color="sky" />
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search forms..."
                  aria-label="Search forms"
                  className="w-full sm:w-56 bg-white/6 border-white/10 text-white placeholder:text-white/30 pl-9 rounded-full focus:border-violet-500/50 focus:ring-0"
                />
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/4 p-0.5">
                {(["all", "live", "draft"] as Filter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    aria-pressed={filter === key}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-all",
                      filter === key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-white/40 hover:text-white/70",
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => createMutation.mutate(undefined)}
              >
                <Plus className="h-4 w-4" />
                Blank Form
              </Button>
              <Button
                className="rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                onClick={() => setAiOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                Create with AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        {formsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/8 bg-white/3" />
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
        <AlertDialogContent className="rounded-2xl bg-[#111118] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete "{pendingDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              This permanently removes the form and every response it collected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-rose-600 hover:bg-rose-500 text-white border-0"
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

const statColorMap = {
  violet: { bg: "bg-violet-500/10", icon: "text-violet-400", num: "text-white" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", num: "text-white" },
  sky: { bg: "bg-sky-500/10", icon: "text-sky-400", num: "text-white" },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: keyof typeof statColorMap;
}) {
  const c = statColorMap[color];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 sm:px-5 py-3.5 shadow-sm">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", c.bg)}>
        <Icon className={cn("h-4 w-4", c.icon)} />
      </div>
      <div>
        <p className={cn("text-xl sm:text-2xl font-bold leading-none", c.num)}>{value}</p>
        <p className="mt-1 text-[11px] font-bold tracking-widest text-white/30 uppercase">{label}</p>
      </div>
    </div>
  );
}

const cardAccents = [
  "from-violet-500/30 to-violet-600/20",
  "from-sky-500/30 to-sky-600/20",
  "from-pink-500/30 to-pink-600/20",
  "from-emerald-500/30 to-emerald-600/20",
  "from-amber-500/30 to-amber-600/20",
  "from-rose-500/30 to-rose-600/20",
];

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
  const accentGradient = cardAccents[index % cardAccents.length];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.25) }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-white/4 p-5 sm:p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 hover:border-white/15 hover:bg-white/6"
    >
      {/* Top gradient accent bar */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80",
          form.published ? accentGradient : "from-white/10 to-white/5",
        )}
      />

      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <Link
            to="/builder/$id"
            params={{ id: form.id }}
            className="text-base sm:text-lg font-bold text-white leading-snug hover:text-violet-300 transition-colors line-clamp-2"
          >
            {form.title}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="shrink-0 rounded-lg p-1.5 text-white/30 hover:text-white hover:bg-white/8 transition-all"
                aria-label={`Actions for ${form.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg bg-[#111118] border-white/10">
              <DropdownMenuItem asChild className="text-white/80 focus:text-white focus:bg-white/8">
                <Link to="/builder/$id" params={{ id: form.id }}>
                  <Pencil className="h-4 w-4" />
                  Edit Form
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-white/80 focus:text-white focus:bg-white/8">
                <Link to="/responses/$id" params={{ id: form.id }}>
                  <BarChart3 className="h-4 w-4" />
                  View Responses
                </Link>
              </DropdownMenuItem>
              {form.published && (
                <>
                  <DropdownMenuItem onClick={onShare} className="text-white/80 focus:text-white focus:bg-white/8">
                    <Share2 className="h-4 w-4" />
                    Share / QR & Embed
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/80 focus:text-white focus:bg-white/8">
                    <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open Live Link
                    </a>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete Form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-white/35">
          {form.description || `${form.fields.length} question${form.fields.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/6 pt-4">
        <Badge
          variant={form.published ? "default" : "secondary"}
          className={form.published
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            : "bg-white/5 text-white/40 border-white/8"
          }
        >
          {form.published ? "● Live" : "○ Draft"}
        </Badge>
        <Link
          to="/responses/$id"
          params={{ id: form.id }}
          className="text-xs font-semibold text-white/35 hover:text-violet-400 transition-colors"
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
      <DialogContent className="sm:max-w-md rounded-2xl bg-[#111118] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Share2 className="h-5 w-5 text-violet-400" />
            Share "{form.title}"
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Share the live form link, download poster QR code, or embed on your website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Form URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60">Live Form Link</label>
            <div className="flex gap-2">
              <Input value={fullUrl} readOnly className="rounded-lg font-mono text-xs bg-white/5 border-white/10 text-white" />
              <Button size="sm" onClick={copyLink} className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-1.5 text-center p-4 border border-white/8 rounded-xl bg-white/3">
            <label className="text-xs font-semibold text-white/70 flex items-center justify-center gap-1.5 mb-2">
              <QrCode className="h-4 w-4 text-violet-400" /> Scannable Poster QR Code
            </label>
            <img src={qrApiUrl} alt="Form QR Code" className="mx-auto h-36 w-36 rounded-lg border border-white/10 shadow-sm" />
            <a
              href={qrApiUrl}
              download={`${form.slug}-qr.png`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-xs font-medium text-violet-400 hover:underline"
            >
              Download QR Code Image
            </a>
          </div>

          {/* Embed snippet */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60">Website Embed Code (Iframe)</label>
            <div className="flex gap-2">
              <Input value={embedCode} readOnly className="rounded-lg font-mono text-xs bg-white/5 border-white/10 text-white" />
              <Button size="sm" variant="outline" onClick={copyEmbedSnippet} className="rounded-lg shrink-0 bg-white/5 border-white/10 text-white hover:bg-white/10">
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
      className="relative overflow-hidden rounded-3xl border border-dashed border-white/15 p-12 text-center bg-white/2"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-violet-500/8 blur-[60px]" />
      <div className="relative">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400 mb-5 border border-violet-500/20"
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">
          {hasForms ? "Nothing matches that search" : "Your first form is one sentence away"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/40">
          {hasForms
            ? "Try a different title or clear the filter."
            : "Describe what you want to ask and FlowForm writes the questions for you."}
        </p>
        {!hasForms && (
          <Button
            className="mt-6 rounded-full bg-violet-600 hover:bg-violet-500 text-white px-6 shadow-lg shadow-violet-500/20"
            onClick={onCreate}
          >
            <Sparkles className="h-4 w-4" />
            Create with AI
          </Button>
        )}
      </div>
    </motion.div>
  );
}
