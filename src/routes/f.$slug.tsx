import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { FormSurface } from "@/components/form/FormSurface";
import { getPublicFormBySlug } from "@/lib/public-form.functions";
import { getPublicForm } from "@/lib/forms-api";
import { submitResponse } from "@/lib/submit.functions";
import type { FormField, ThemeId } from "@/lib/form-schema";

export const Route = createFileRoute("/f/$slug")({
  loader: async ({ params }) => {
    const form = await getPublicFormBySlug({ data: { slug: params.slug } });
    return { form, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData || !loaderData.form) {
      return {
        meta: [{ title: "Form unavailable — FlowForm" }, { name: "robots", content: "noindex" }],
      };
    }
    const { title, description } = loaderData.form;
    const desc = description || `Fill in "${title}" — it only takes a moment.`;
    return {
      meta: [
        { title: `${title} — FlowForm` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  errorComponent: () => (
    <Centered title="This form didn't load" body="Please refresh the page and try again." />
  ),
  component: PublicForm,
});

function PublicForm() {
  const { form: serverForm, slug } = Route.useLoaderData();
  const [form, setForm] = useState(serverForm);
  const [notFoundLocal, setNotFoundLocal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!serverForm) {
      getPublicForm(slug).then((localForm) => {
        if (localForm) {
          // Normalize to PublicForm format since getPublicForm returns FormRecord
          setForm({
            id: localForm.id,
            slug: localForm.slug,
            title: localForm.title,
            description: localForm.description,
            theme: localForm.theme,
            fields: localForm.fields,
            coverUrl: localForm.cover_url,
            success_title: localForm.success_title,
            success_message: localForm.success_message,
          } as any);
        } else {
          setNotFoundLocal(true);
        }
      });
    }
  }, [serverForm, slug]);

  if (notFoundLocal) {
    return <Centered title="This form isn't available" body="The link may be wrong, or the form is no longer accepting responses." />;
  }

  if (!form) {
    return <Centered title="Loading..." body="Please wait while we find this form." />;
  }

  if (done) {
    return (
      <div
        data-form-theme={form.theme as ThemeId}
        className="flex min-h-screen items-center justify-center px-5"
        style={{ background: "var(--form-bg)", color: "var(--form-ink)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 16 }}
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--form-accent)", color: "var(--form-accent-ink)" }}
          >
            <Check className="h-7 w-7" />
          </motion.span>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--form-display)" }}
          >
            {done.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--form-muted)" }}>
            {done.message}
          </p>
          <p className="mt-10 text-[13px]" style={{ color: "var(--form-muted)" }}>
            <Link to="/" className="underline underline-offset-4">
              Made with FlowForm
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <FormSurface
        form={{
          title: form.title,
          description: form.description,
          theme: form.theme as ThemeId,
          fields: form.fields as FormField[],
          coverUrl: form.coverUrl,
        }}

        submitting={submitting}
        onSubmit={async (answers) => {
          setSubmitting(true);
          try {
            if (notFoundLocal === false && serverForm === null) {
              // We loaded this form from local storage, so save response locally
              const { saveLocalResponseDirect } = await import("@/lib/forms-api");
              saveLocalResponseDirect(form.id, answers);
              setSubmitting(false);
              setDone({ 
                title: (form as any).success_title || "Response received!", 
                message: (form as any).success_message || "Thank you for completing this form." 
              });
              return;
            }

            const result = await submitResponse({
              data: { slug: form.slug, answers },
            });
            setDone({ title: result.successTitle, message: result.successMessage });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "We couldn't send your response.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}

function Centered({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">{body}</p>
        <p className="mt-8 text-[13px] text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            Go to FlowForm
          </Link>
        </p>
      </div>
    </div>
  );
}
