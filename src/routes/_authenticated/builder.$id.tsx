import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, Check, Copy, Eye, Sparkles, Globe } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AiGenerateDialog } from "@/components/builder/AiGenerateDialog";
import { FieldPalette } from "@/components/builder/FieldPalette";
import { FieldSettings } from "@/components/builder/FieldSettings";
import { FlyerUpload } from "@/components/builder/FlyerUpload";

import { SortableFieldCard } from "@/components/builder/SortableFieldCard";
import { FormSurface } from "@/components/form/FormSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { improveQuestion } from "@/lib/ai.functions";
import { useFlyerUrl } from "@/hooks/use-flyer-url";

import { THEMES, createField, newFieldId, type FieldType, type FormField, type ThemeId } from "@/lib/form-schema";
import { getForm, updateForm, type FormRecord } from "@/lib/forms-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/builder/$id")({
  head: () => ({
    meta: [
      { title: "Form builder — FlowForm" },
      { name: "description", content: "Design your form with drag-and-drop and AI assistance." },
      { property: "og:title", content: "Form builder — FlowForm" },
      { property: "og:description", content: "Design your form with drag-and-drop and AI assistance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Builder,
});

type SaveState = "saved" | "saving" | "dirty";

function Builder() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<FormRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [aiOpen, setAiOpen] = useState(false);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formQuery = useQuery({ queryKey: ["form", id], queryFn: () => getForm(id) });
  const coverUrl = useFlyerUrl(draft?.cover_url);


  useEffect(() => {
    if (formQuery.data && !draft) setDraft(formQuery.data);
  }, [formQuery.data, draft]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selectedField = useMemo(
    () => draft?.fields.find((f) => f.id === selectedId) ?? null,
    [draft, selectedId],
  );

  function patch(next: Partial<FormRecord>, immediate = false) {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
    setSaveState("dirty");
    if (timer.current) clearTimeout(timer.current);
    const run = async () => {
      setSaveState("saving");
      try {
        await updateForm(id, next);
        setSaveState("saved");
        queryClient.invalidateQueries({ queryKey: ["forms"] });
      } catch (error) {
        setSaveState("dirty");
        toast.error(error instanceof Error ? error.message : "Couldn't save changes.");
      }
    };
    if (immediate) void run();
    else timer.current = setTimeout(run, 700);
  }

  function patchFields(fields: FormField[]) {
    patch({ fields });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!draft || !over || active.id === over.id) return;
    const oldIndex = draft.fields.findIndex((f) => f.id === active.id);
    const newIndex = draft.fields.findIndex((f) => f.id === over.id);
    patchFields(arrayMove(draft.fields, oldIndex, newIndex));
  }

  function addField(type: FieldType) {
    if (!draft) return;
    const field = createField(type);
    patchFields([...draft.fields, field]);
    setSelectedId(field.id);
  }

  async function improve(field: FormField) {
    if (!draft) return;
    setImprovingId(field.id);
    try {
      const result = await improveQuestion({
        data: { label: field.label, context: draft.title },
      });
      patchFields(
        draft.fields.map((f) =>
          f.id === field.id ? { ...f, label: result.label, help: result.help || f.help } : f,
        ),
      );
      toast.success("Question improved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The AI couldn't improve that question.");
    } finally {
      setImprovingId(null);
    }
  }

  if (formQuery.isLoading || !draft) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${draft.slug}` : "";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Forms
          </Link>
          <span className="hidden text-[13px] text-muted-foreground sm:inline">
            {saveState === "saving" ? "Saving…" : saveState === "dirty" ? "Unsaved" : "All changes saved"}
          </span>
        </div>
      </AppHeader>

      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              aria-label="Form title"
              maxLength={120}
              className="w-full truncate bg-transparent text-2xl font-semibold tracking-tight outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/responses/$id" params={{ id: draft.id }}>
                <BarChart3 className="h-4 w-4" />
                Responses
              </Link>
            </Button>
            {draft.published && (
              <Button asChild variant="outline" size="sm">
                <a href={`/f/${draft.slug}`} target="_blank" rel="noreferrer">
                  <Eye className="h-4 w-4" />
                  View live
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant={draft.published ? "secondary" : "default"}
              onClick={() => {
                patch({ published: !draft.published }, true);
                toast.success(draft.published ? "Form unpublished" : "Your form is live");
              }}
            >
              <Globe className="h-4 w-4" />
              {draft.published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>

        {draft.published && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="text-[13px] text-muted-foreground">Share link</span>
            <code className="min-w-0 flex-1 truncate text-[13px]">{shareUrl}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success("Link copied");
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
          </motion.div>
        )}

        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Tabs defaultValue="build">
              <TabsList className="w-full">
                <TabsTrigger value="build" className="flex-1">
                  Build
                </TabsTrigger>
                <TabsTrigger value="design" className="flex-1">
                  Design
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="build" className="mt-4 space-y-5">
                <Button variant="outline" className="w-full" onClick={() => setAiOpen(true)}>
                  <Sparkles className="h-4 w-4 text-signal" />
                  Rebuild with AI
                </Button>
                {selectedField ? (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[13px] font-medium">Question settings</p>
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="text-[12px] text-muted-foreground hover:text-foreground"
                      >
                        Done
                      </button>
                    </div>
                    <FieldSettings
                      field={selectedField}
                      onChange={(fieldPatch) =>
                        patchFields(
                          draft.fields.map((f) =>
                            f.id === selectedField.id ? { ...f, ...fieldPatch } : f,
                          ),
                        )
                      }
                    />
                  </div>
                ) : (
                  <FieldPalette onAdd={addField} />
                )}
              </TabsContent>

              <TabsContent value="design" className="mt-4 space-y-4">
                <div className="space-y-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => patch({ theme: theme.id as ThemeId })}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:-translate-y-px",
                        draft.theme === theme.id
                          ? "border-signal shadow-soft"
                          : "border-border hover:border-foreground/25",
                      )}
                      aria-pressed={draft.theme === theme.id}
                    >
                      <span className="flex overflow-hidden rounded-md border border-border">
                        {theme.swatch.map((color) => (
                          <span key={color} className="h-9 w-3.5" style={{ background: color }} />
                        ))}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium">{theme.name}</span>
                        <span className="block truncate text-[12px] text-muted-foreground">
                          {theme.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <FlyerUpload
                    formId={draft.id}
                    value={draft.cover_url}
                    onChange={(path) => patch({ cover_url: path }, true)}
                  />
                </div>
              </TabsContent>


              <TabsContent value="settings" className="mt-4 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Form description</Label>
                  <Textarea
                    id="desc"
                    rows={3}
                    maxLength={300}
                    value={draft.description}
                    placeholder="A short line to set expectations"
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stitle">Success page title</Label>
                  <Input
                    id="stitle"
                    maxLength={120}
                    value={draft.success_title}
                    onChange={(e) => patch({ success_title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="smsg">Success page message</Label>
                  <Textarea
                    id="smsg"
                    rows={3}
                    maxLength={300}
                    value={draft.success_message}
                    onChange={(e) => patch({ success_message: e.target.value })}
                  />
                </div>
                <ToggleRow
                  id="notify"
                  title="Email me new responses"
                  description="Get a notification each time someone submits."
                  checked={draft.notify_owner}
                  onChange={(checked) => patch({ notify_owner: checked }, true)}
                />
                <ToggleRow
                  id="confirm"
                  title="Send a confirmation email"
                  description="Respondents get a copy of their answers (needs an email question)."
                  checked={draft.send_confirmation}
                  onChange={(checked) => patch({ send_confirmation: checked }, true)}
                />
              </TabsContent>
            </Tabs>
          </aside>

          <div className="grid gap-5 xl:grid-cols-2">
            <section aria-label="Questions" className="space-y-2.5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={draft.fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {draft.fields.map((field, index) => (
                    <SortableFieldCard
                      key={field.id}
                      field={field}
                      index={index}
                      selected={selectedId === field.id}
                      improving={improvingId === field.id}
                      onSelect={() => setSelectedId(field.id)}
                      onImprove={() => improve(field)}
                      onDuplicate={() => {
                        const copy = { ...field, id: newFieldId() };
                        const next = [...draft.fields];
                        next.splice(index + 1, 0, copy);
                        patchFields(next);
                      }}
                      onDelete={() => {
                        patchFields(draft.fields.filter((f) => f.id !== field.id));
                        if (selectedId === field.id) setSelectedId(null);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {draft.fields.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <p className="text-[14px] text-muted-foreground">
                    Add a question from the panel, or let AI write the whole form.
                  </p>
                </div>
              )}
            </section>

            <section aria-label="Preview" className="hidden xl:block">
              <div className="sticky top-20 overflow-hidden rounded-xl border border-border shadow-soft">
                <div className="flex items-center gap-1.5 border-b border-border bg-card px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/25" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/25" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/25" />
                  <span className="ml-2 text-[11px] text-muted-foreground">Live preview</span>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <FormSurface preview form={{ ...draft, coverUrl }} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AiGenerateDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        mode="replace"
        onGenerated={(result) =>
          patch(
            { title: result.title, description: result.description, fields: result.fields },
            true,
          )
        }
      />
    </div>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-3">
      <div>
        <Label htmlFor={id} className="text-[14px]">
          {title}
        </Label>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
