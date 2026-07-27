import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlyerUrl } from "@/hooks/use-flyer-url";
import { removeFlyer, uploadFlyer } from "@/lib/forms-api";

interface Props {
  formId: string;
  value: string | null;
  onChange: (path: string | null) => void;
}

/** Event flyer / cover image picker shown in the builder's Design tab. */
export function FlyerUpload({ formId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const previewUrl = useFlyerUrl(value);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadFlyer(file, formId);
      if (value) void removeFlyer(value);
      onChange(path);
      toast.success("Flyer added to your form");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That upload didn't work.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-medium">Event flyer</p>
      <p className="text-[12px] text-muted-foreground">
        Shown at the top of your public form. PNG or JPG, up to 5&nbsp;MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload event flyer"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <img src={previewUrl} alt="Event flyer preview" className="h-32 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
                Replace
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => {
                  if (value) void removeFlyer(value);
                  onChange(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="empty"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files?.[0]);
            }}
            disabled={busy}
            className={`flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-colors ${
              dragging ? "border-foreground bg-accent" : "border-border hover:border-foreground/40"
            }`}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-[13px] font-medium">
              {busy ? "Uploading…" : "Upload a flyer"}
            </span>
            <span className="text-[12px] text-muted-foreground">Click or drop an image here</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
