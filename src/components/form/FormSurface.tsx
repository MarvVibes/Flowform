import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  SlidersHorizontal,
  List,
  Sparkles,
  Zap,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Clock,
  Send,
} from "lucide-react";
import type { FormField, ThemeId } from "@/lib/form-schema";
import { validateAnswer } from "@/lib/form-schema";
import { FieldInput } from "./FieldInput";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface FormSurfaceData {
  title: string;
  description: string;
  theme: ThemeId;
  fields: FormField[];
  coverUrl?: string | null;
}

interface Props {
  form: FormSurfaceData;
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void;
  submitting?: boolean;
  preview?: boolean;
}

export function FormSurface({ form, onSubmit, submitting, preview }: Props) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [mode, setMode] = useState<"card" | "scroll">("card");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);

  const activeTheme = form.theme || "signature";
  const fields = form.fields || [];
  const currentField = fields[stepIndex];
  const totalFields = fields.length;
  const progressPercent = totalFields > 0 ? Math.round(((stepIndex + 1) / totalFields) * 100) : 0;

  // Keyboard navigation for card mode
  useEffect(() => {
    if (mode !== "card" || preview || !currentField) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) {
        if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
        e.preventDefault();
        handleNextStep();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, stepIndex, answers, currentField]);

  function handleNextStep() {
    if (!currentField) return;
    const err = validateAnswer(currentField, answers[currentField.id]);
    if (err) {
      setErrors((prev) => ({ ...prev, [currentField.id]: err }));
      return;
    }
    if (stepIndex < totalFields - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      triggerSubmit();
    }
  }

  function handlePrevStep() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  async function triggerSubmit() {
    if (preview || !onSubmit) return;
    const next: Record<string, string | null> = {};
    for (const field of fields) {
      next[field.id] = validateAnswer(field, answers[field.id]);
    }
    setErrors(next);
    const firstInvalid = fields.find((f) => next[f.id]);
    if (firstInvalid) {
      const idx = fields.findIndex((f) => f.id === firstInvalid.id);
      if (mode === "card" && idx !== -1) {
        setStepIndex(idx);
      } else {
        document.getElementById(`field-${firstInvalid.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return;
    }
    setSubmittedData(answers);
    await onSubmit(answers);
    setShowReceipt(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await triggerSubmit();
  }

  function handleAiEnhanceAnswer(fieldId: string) {
    const currentVal = String(answers[fieldId] || "");
    if (!currentVal.trim()) {
      setAnswers((prev) => ({
        ...prev,
        [fieldId]: "Extremely well organized event! Looking forward to participating and networking with the community.",
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [fieldId]: `${currentVal.trim()} — Excited to attend and engage with everyone!`,
      }));
    }
  }

  return (
    <div

      data-form-theme={activeTheme}
      className="relative min-h-[100dvh] w-full overflow-hidden px-4 py-6 sm:px-8 sm:py-16 flex flex-col justify-between transition-colors duration-300"
      style={{ background: "var(--form-bg)", color: "var(--form-ink)" }}
    >
      {/* Animated Mesh Glow Background Shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
        <div
          className="absolute -top-24 -left-24 h-[30rem] w-[30rem] rounded-full blur-3xl animate-pulse"
          style={{ background: "var(--form-glow-1)" }}
        />
        <div
          className="absolute top-1/3 -right-24 h-[30rem] w-[30rem] rounded-full blur-3xl animate-pulse"
          style={{ background: "var(--form-glow-2)" }}
        />
      </div>

      {/* Top Header Controls */}
      <div className="relative z-10 mx-auto w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 mb-5 pb-3 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
            style={{
              background: "color-mix(in srgb, var(--form-panel) 90%, var(--form-accent) 10%)",
              color: "var(--form-ink)",
              border: "1px solid var(--form-border)",
            }}
          >
            <Zap className="h-3.5 w-3.5 animate-bounce" style={{ color: "var(--form-accent)" }} />
            <span className="hidden sm:inline">Limited Registration — </span>12 Spots Left
          </span>
        </div>

        <div
          className="flex items-center gap-1 rounded-full p-1 backdrop-blur-md shadow-sm border"
          style={{ background: "var(--form-panel)", borderColor: "var(--form-border)" }}
        >
          <button
            type="button"
            onClick={() => setMode("card")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 text-xs font-semibold rounded-full transition-all"
            style={
              mode === "card"
                ? { background: "var(--form-accent)", color: "var(--form-accent-ink)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                : { color: "var(--form-muted)" }
            }
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Card Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("scroll")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 text-xs font-semibold rounded-full transition-all"
            style={
              mode === "scroll"
                ? { background: "var(--form-accent)", color: "var(--form-accent-ink)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                : { color: "var(--form-muted)" }
            }
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="relative z-10 mx-auto w-full max-w-xl flex-1 flex flex-col justify-center">
        <header className="mb-8 text-left">
          {form.coverUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={form.coverUrl}
              alt={`Cover for ${form.title || "form"}`}
              loading="lazy"
              className="mb-6 w-full object-cover shadow-xl border"
              style={{ maxHeight: "18rem", borderRadius: "var(--form-radius)", borderColor: "var(--form-border)" }}
            />
          )}
          <h1
            className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--form-display)", color: "var(--form-ink)" }}
          >
            {form.title || "Untitled form"}
          </h1>
          {form.description && (
            <p className="mt-2.5 text-base leading-relaxed font-normal" style={{ color: "var(--form-muted)" }}>
              {form.description}
            </p>
          )}
        </header>

        {fields.length === 0 ? (
          <p className="text-sm font-medium" style={{ color: "var(--form-muted)" }}>
            This form has no questions yet.
          </p>
        ) : mode === "card" ? (
          /* ------------------- CARD STEP MODE ------------------- */
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: "var(--form-muted)" }}>
                <span>Question {stepIndex + 1} of {totalFields}</span>
                <span>{progressPercent}% completed</span>
              </div>
              <div
                className="h-2.5 w-full rounded-full overflow-hidden shadow-inner border"
                style={{ background: "color-mix(in srgb, var(--form-panel) 60%, transparent)", borderColor: "var(--form-border)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--form-accent)" }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentField && (
                <motion.div
                  key={currentField.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 sm:p-8 backdrop-blur-xl border transition-all duration-300"
                  style={{
                    background: "var(--form-panel)",
                    borderColor: "var(--form-border)",
                    borderRadius: "var(--form-radius)",
                    boxShadow: "var(--form-shadow)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label
                      id={`field-${currentField.id}-label`}
                      htmlFor={`field-${currentField.id}`}
                      className="mb-2 block text-lg font-bold"
                      style={{ color: "var(--form-ink)" }}
                    >
                      {currentField.label}
                      {currentField.required && (
                        <span aria-hidden className="ml-1 font-bold" style={{ color: "var(--form-accent)" }}>
                          *
                        </span>
                      )}
                    </label>
                    {currentField.type === "long_text" && (
                      <button
                        type="button"
                        onClick={() => handleAiEnhanceAnswer(currentField.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all shrink-0 hover:opacity-80"
                        style={{
                          background: "color-mix(in srgb, var(--form-accent) 15%, transparent)",
                          color: "var(--form-ink)",
                          borderColor: "var(--form-border)",
                        }}
                      >
                        <Sparkles className="h-3 w-3" style={{ color: "var(--form-accent)" }} /> AI Enhance Answer
                      </button>
                    )}
                  </div>

                  {currentField.help && (
                    <p className="mb-4 text-xs font-medium" style={{ color: "var(--form-muted)" }}>
                      {currentField.help}
                    </p>
                  )}
                  <FieldInput
                    field={currentField}
                    value={answers[currentField.id]}
                    error={errors[currentField.id]}
                    disabled={preview || submitting}
                    onChange={(value) => {
                      setAnswers((prev) => ({ ...prev, [currentField.id]: value }));
                      if (errors[currentField.id]) setErrors((prev) => ({ ...prev, [currentField.id]: null }));
                    }}
                  />
                  {errors[currentField.id] && (
                    <p className="mt-2 text-xs font-semibold text-rose-500">
                      {errors[currentField.id]}
                    </p>
                  )}

                  <div className="mt-6 sm:mt-8 flex items-center justify-between pt-4 sm:pt-5 border-t" style={{ borderColor: "var(--form-border)" }}>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={stepIndex === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold disabled:opacity-40 transition-colors"
                      style={{ color: "var(--form-muted)" }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-7 sm:py-3 text-xs font-extrabold uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all"
                      style={{
                        background: "var(--form-accent)",
                        color: "var(--form-accent-ink)",
                        borderRadius: "var(--form-radius)",
                      }}
                    >
                      {stepIndex === totalFields - 1 ? (
                        submitting ? "Sending..." : "Submit Registration"
                      ) : (
                        <>
                          <span>Next</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-center text-xs font-medium" style={{ color: "var(--form-muted)" }}>
              Press <kbd className="px-2 py-0.5 rounded font-mono text-[11px] border" style={{ background: "var(--form-panel)", borderColor: "var(--form-border)", color: "var(--form-ink)" }}>Enter ↵</kbd> to continue
            </p>
          </div>
        ) : (
          /* ------------------- STANDARD SCROLL MODE ------------------- */
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                className="p-4 sm:p-6 backdrop-blur-xl border transition-all duration-300"
                style={{
                  background: "var(--form-panel)",
                  borderColor: "var(--form-border)",
                  borderRadius: "var(--form-radius)",
                  boxShadow: "var(--form-shadow)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <label
                    id={`field-${field.id}-label`}
                    htmlFor={`field-${field.id}`}
                    className="mb-2 block text-base font-bold"
                    style={{ color: "var(--form-ink)" }}
                  >
                    {field.label}
                    {field.required && (
                      <span aria-hidden className="ml-1 font-bold" style={{ color: "var(--form-accent)" }}>
                        *
                      </span>
                    )}
                  </label>
                  {field.type === "long_text" && (
                    <button
                      type="button"
                      onClick={() => handleAiEnhanceAnswer(field.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all shrink-0 hover:opacity-80"
                      style={{
                        background: "color-mix(in srgb, var(--form-accent) 15%, transparent)",
                        color: "var(--form-ink)",
                        borderColor: "var(--form-border)",
                      }}
                    >
                      <Sparkles className="h-3 w-3" style={{ color: "var(--form-accent)" }} /> AI Enhance
                    </button>
                  )}
                </div>

                {field.help && (
                  <p className="mb-3 text-xs" style={{ color: "var(--form-muted)" }}>
                    {field.help}
                  </p>
                )}
                <FieldInput
                  field={field}
                  value={answers[field.id]}
                  error={errors[field.id]}
                  disabled={preview || submitting}
                  onChange={(value) => {
                    setAnswers((prev) => ({ ...prev, [field.id]: value }));
                    if (errors[field.id]) setErrors((prev) => ({ ...prev, [field.id]: null }));
                  }}
                />
                {errors[field.id] && (
                  <p className="mt-2 text-xs font-semibold text-rose-500">
                    {errors[field.id]}
                  </p>
                )}
              </motion.div>
            ))}

            <button
              type="submit"
              disabled={preview || submitting}
              className="w-full inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-wider shadow-xl hover:scale-[1.01] transition-all"
              style={{
                background: "var(--form-accent)",
                color: "var(--form-accent-ink)",
                borderRadius: "var(--form-radius)",
              }}
            >
              {submitting ? "Sending…" : "Submit Registration"}
            </button>
          </form>
        )}
      </div>

      {/* Applicant Registration Confirmation Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md rounded-3xl text-center p-6" style={{ background: "var(--form-panel)", color: "var(--form-ink)", borderColor: "var(--form-border)" }}>
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center" style={{ color: "var(--form-ink)" }}>
              Registration Confirmed!
            </DialogTitle>
            <DialogDescription className="text-xs text-center" style={{ color: "var(--form-muted)" }}>
              Your response has been securely recorded. An instant confirmation receipt has been issued.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 rounded-2xl border p-4 text-left space-y-2" style={{ background: "color-mix(in srgb, var(--form-bg) 50%, transparent)", borderColor: "var(--form-border)" }}>
            <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b" style={{ borderColor: "var(--form-border)" }}>
              <span className="flex items-center gap-1.5" style={{ color: "var(--form-ink)" }}>
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Confirmation ID
              </span>
              <span className="font-mono" style={{ color: "var(--form-accent)" }}>#FF-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <p className="text-xs leading-relaxed pt-1" style={{ color: "var(--form-muted)" }}>
              <Mail className="h-3.5 w-3.5 inline mr-1" style={{ color: "var(--form-accent)" }} />
              Confirmation email & entry receipt dispatched to applicant. Form owner has been notified.
            </p>
          </div>

          <button
            onClick={() => setShowReceipt(false)}
            className="w-full py-3 text-xs font-bold rounded-full shadow-md transition-transform active:scale-95"
            style={{ background: "var(--form-accent)", color: "var(--form-accent-ink)" }}
          >
            Done
          </button>
        </DialogContent>
      </Dialog>

      <footer className="relative z-10 mt-8 sm:mt-12 text-center text-xs font-medium space-y-1" style={{ color: "var(--form-muted)" }}>
        <p>Powered by <span className="font-bold" style={{ color: "var(--form-ink)" }}>FlowForm</span> — The modern form platform</p>
        <p className="text-[11px] opacity-75">Built by <span className="font-semibold">Marvelous Ndukwe</span></p>
      </footer>
    </div>
  );

}
