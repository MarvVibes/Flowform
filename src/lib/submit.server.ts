/**
 * Server-only submission pipeline: validate the form is published, store the
 * response, then hand the notification + confirmation emails to the mailer.
 */
import { renderConfirmationEmail, renderNotificationEmail, sendEmail } from "./email.server";

interface SubmitInput {
  slug: string;
  answers: Record<string, unknown>;
  respondentEmail?: string | null;
}

interface FieldLike {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

export async function submitToForm(input: SubmitInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows, error } = await supabaseAdmin
    .from("forms")
    .select("*")
    .eq("slug", input.slug)
    .eq("published", true)
    .limit(1);

  const form = rows?.[0];

  if (error) throw new Error("Could not load this form.");
  if (!form) throw new Error("This form is no longer accepting responses.");

  const fields = (Array.isArray(form.fields) ? form.fields : []) as unknown as FieldLike[];
  const allowed = new Set(fields.map((f) => f.id));
  const answers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input.answers)) {
    if (allowed.has(key)) answers[key] = value;
  }

  for (const field of fields) {
    const value = answers[field.id];
    const empty = Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim();
    if (field.required && empty) throw new Error(`"${field.label}" is required.`);
  }

  const emailField = fields.find((f) => f.type === "email");
  const respondentEmail =
    input.respondentEmail || (emailField ? String(answers[emailField.id] ?? "") || null : null);

  const { error: insertError } = await supabaseAdmin.from("responses").insert({
    form_id: form.id,
    data: answers as never,
    respondent_email: respondentEmail,
  });
  if (insertError) throw new Error("We couldn't save your response. Please try again.");

  const summary = fields.map((f) => ({
    label: f.label,
    value: Array.isArray(answers[f.id])
      ? (answers[f.id] as unknown[]).join(", ")
      : String(answers[f.id] ?? "—"),
  }));

  if (form.notify_owner) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", form.user_id)
      .maybeSingle();
    if (profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: `New response — ${form.title}`,
        html: renderNotificationEmail({ formTitle: form.title, summary }),
      });
    }
  }

  if (form.send_confirmation && respondentEmail) {
    await sendEmail({
      to: respondentEmail,
      subject: `We received your response — ${form.title}`,
      html: renderConfirmationEmail({
        formTitle: form.title,
        successTitle: form.success_title,
        successMessage: form.success_message,
        summary,
      }),
    });
  }

  return {
    ok: true as const,
    successTitle: form.success_title,
    successMessage: form.success_message,
  };
}
