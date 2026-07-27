import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateForm, type GeneratedFormPayload } from "@/lib/ai.functions";
import { newFieldId, type FormField } from "@/lib/form-schema";

const EXAMPLES = [
  "Customer feedback for a small coffee shop",
  "RSVP for a 30-person wedding dinner",
  "Job application for a junior designer",
  "Bug report for a mobile app",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (result: { title: string; description: string; fields: FormField[] }) => Promise<void> | void;
  mode?: "create" | "replace";
}

export function AiGenerateDialog({ open, onOpenChange, onGenerated, mode = "create" }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    const value = prompt.trim();
    if (value.length < 3) {
      toast.error("Tell the AI a little more about your form.");
      return;
    }
    setLoading(true);
    try {
      const result: GeneratedFormPayload = await generateForm({ data: { prompt: value } });
      const fields: FormField[] = result.fields.map((f) => ({
        id: newFieldId(),
        type: f.type,
        label: f.label,
        help: f.help,
        required: f.required ?? false,
        options: f.options && f.options.length > 0 ? f.options : undefined,
      }));
      await onGenerated({ title: result.title, description: result.description ?? "", fields });
      setPrompt("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The AI couldn't build that form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-signal" />
            {mode === "replace" ? "Rebuild this form with AI" : "Create a form with AI"}
          </DialogTitle>
          <DialogDescription>
            Describe what you want to ask. One sentence is plenty.
            {mode === "replace" && " This replaces the current questions."}
          </DialogDescription>
        </DialogHeader>

        <Textarea
          autoFocus
          rows={3}
          maxLength={1000}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A feedback form for my coffee shop — I want to know how the service was and whether they'd come back."
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
          }}
        />

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Writing your questions…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate form
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
