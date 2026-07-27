import { Plus, X } from "lucide-react";
import type { FormField } from "@/lib/form-schema";
import { FIELD_META } from "@/lib/form-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}

export function FieldSettings({ field, onChange }: Props) {
  const meta = FIELD_META[field.type];
  const options = field.options ?? [];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="fs-label">Question</Label>
        <Textarea
          id="fs-label"
          value={field.label}
          rows={2}
          maxLength={200}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fs-help">Helper text</Label>
        <Input
          id="fs-help"
          value={field.help ?? ""}
          placeholder="Optional guidance"
          maxLength={200}
          onChange={(e) => onChange({ help: e.target.value })}
        />
      </div>

      {!meta.hasOptions && field.type !== "rating" && field.type !== "yes_no" && (
        <div className="space-y-1.5">
          <Label htmlFor="fs-placeholder">Placeholder</Label>
          <Input
            id="fs-placeholder"
            value={field.placeholder ?? ""}
            placeholder="Type your answer…"
            maxLength={100}
            onChange={(e) => onChange({ placeholder: e.target.value })}
          />
        </div>
      )}

      {meta.hasOptions && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-1.5">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Input
                  value={option}
                  maxLength={120}
                  aria-label={`Option ${index + 1}`}
                  onChange={(e) => {
                    const next = [...options];
                    next[index] = e.target.value;
                    onChange({ options: next });
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove option ${index + 1}`}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  onClick={() => onChange({ options: options.filter((_, i) => i !== index) })}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-signal hover:underline"
            onClick={() => onChange({ options: [...options, `Option ${options.length + 1}`] })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add option
          </button>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-3">
        <div>
          <Label htmlFor="fs-required" className="text-[14px]">
            Required
          </Label>
          <p className="text-[12px] text-muted-foreground">People must answer before submitting.</p>
        </div>
        <Switch
          id="fs-required"
          checked={field.required}
          onCheckedChange={(checked) => onChange({ required: checked })}
        />
      </div>
    </div>
  );
}
