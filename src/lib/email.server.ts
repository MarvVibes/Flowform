/**
 * Server-only mailer.
 *
 * Delivery runs through Lovable's managed email service, which requires a
 * verified sender domain for the project. Until one is configured the send is
 * skipped gracefully so form submissions never fail because of email.
 */

interface SummaryRow {
  label: string;
  value: string;
}

const shell = (title: string, body: string) => `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:32px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1f;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a94;margin-bottom:20px;">FlowForm</div>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#a0a0aa;">Sent by FlowForm</p>
  </div>
</body></html>`;

const rows = (summary: SummaryRow[]) =>
  summary
    .map(
      (r) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eeeef2;font-size:13px;color:#8a8a94;width:40%;vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eeeef2;font-size:14px;color:#1a1a1f;">${escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join("");

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderNotificationEmail(opts: { formTitle: string; summary: SummaryRow[] }) {
  return shell(
    `New response — ${opts.formTitle}`,
    `<h1 style="font-size:22px;margin:0 0 8px;">You have a new response</h1>
     <p style="font-size:15px;color:#5a5a66;margin:0 0 24px;">Someone just completed <strong>${escapeHtml(opts.formTitle)}</strong>.</p>
     <table style="width:100%;border-collapse:collapse;">${rows(opts.summary)}</table>`,
  );
}

export function renderConfirmationEmail(opts: {
  formTitle: string;
  successTitle: string;
  successMessage: string;
  summary: SummaryRow[];
}) {
  return shell(
    opts.successTitle,
    `<h1 style="font-size:22px;margin:0 0 8px;">${escapeHtml(opts.successTitle)}</h1>
     <p style="font-size:15px;color:#5a5a66;margin:0 0 24px;">${escapeHtml(opts.successMessage)}</p>
     <p style="font-size:13px;color:#8a8a94;margin:0 0 8px;">Here's a copy of what you sent to <strong>${escapeHtml(opts.formTitle)}</strong>:</p>
     <table style="width:100%;border-collapse:collapse;">${rows(opts.summary)}</table>`,
  );
}

export async function sendEmail(message: { to: string; subject: string; html: string }) {
  try {
    // The managed send helper only exists once an email domain is configured
    // for the project. Resolve it lazily so submissions keep working without it.
    const specifier = "@/lib/email-templates/send-email";
    const mod = (await import(/* @vite-ignore */ specifier).catch(() => null)) as {
      sendRawEmail?: (m: typeof message) => Promise<unknown>;
    } | null;


    if (mod?.sendRawEmail) {
      await mod.sendRawEmail(message);
      return { sent: true as const };
    }
  } catch (error) {
    console.error("[email] delivery failed", error);
    return { sent: false as const, reason: "delivery_error" as const };
  }

  console.warn(
    `[email] skipped "${message.subject}" -> ${message.to}: no verified sender domain configured for this project.`,
  );
  return { sent: false as const, reason: "no_email_domain" as const };
}
