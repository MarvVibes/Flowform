import { supabase } from "@/integrations/supabase/client";
import type { FormField, ThemeId } from "./form-schema";
import { slugify } from "./form-schema";

export interface FormRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  slug: string;
  theme: ThemeId;
  fields: FormField[];
  cover_url: string | null;
  published: boolean;
  success_title: string;
  success_message: string;
  notify_owner: boolean;
  send_confirmation: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResponseRecord {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  respondent_email: string | null;
  created_at: string;
}

type RawForm = Omit<FormRecord, "fields" | "theme"> & { fields: unknown; theme: string };

function normalize(row: RawForm): FormRecord {
  return {
    ...row,
    theme: (row.theme || "signature") as ThemeId,
    cover_url: row.cover_url ?? null,
    fields: Array.isArray(row.fields) ? (row.fields as FormField[]) : [],
  };
}

const FLYER_BUCKET = "flyers";

// Local storage fallback helpers
function getLocalForms(): FormRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("flowform_local_forms");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalForms(forms: FormRecord[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("flowform_local_forms", JSON.stringify(forms));
  }
}

function getLocalResponses(): ResponseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("flowform_local_responses");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalResponses(responses: ResponseRecord[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("flowform_local_responses", JSON.stringify(responses));
  }
}

/** Uploads an event flyer and returns its storage path. */
export async function uploadFlyer(file: File, formId: string): Promise<string> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || "demo-user";
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Flyers need to be under 5 MB.");

    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${formId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(FLYER_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    return path;
  } catch {
    // Fallback: create object URL
    return URL.createObjectURL(file);
  }
}

export async function removeFlyer(path: string) {
  try {
    await supabase.storage.from(FLYER_BUCKET).remove([path]);
  } catch {
    /* ignore */
  }
}

/** Resolves a stored flyer path into a viewable URL. */
export async function getFlyerUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  try {
    const { data, error } = await supabase.storage
      .from(FLYER_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (error) return null;
    return data.signedUrl;
  } catch {
    return path;
  }
}

export async function listForms(): Promise<FormRecord[]> {
  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error || !data) throw error;
    return (data as RawForm[]).map(normalize);
  } catch {
    return getLocalForms();
  }
}

export async function getForm(id: string): Promise<FormRecord> {
  try {
    const { data, error } = await supabase.from("forms").select("*").eq("id", id).single();
    if (error || !data) throw error;
    return normalize(data as RawForm);
  } catch {
    const local = getLocalForms().find((f) => f.id === id);
    if (local) return local;
    throw new Error("Form not found");
  }
}

export async function getPublicForm(slug: string): Promise<FormRecord | null> {
  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (data) return normalize(data as RawForm);
  } catch {
    /* ignore */
  }
  const local = getLocalForms().find((f) => f.slug === slug && f.published);
  return local ?? null;
}

export async function createForm(input?: Partial<FormRecord>): Promise<FormRecord> {
  const title = input?.title ?? "Untitled form";
  const newForm: FormRecord = {
    id: `form_${Math.random().toString(36).slice(2, 11)}`,
    user_id: "user_1",
    title,
    description: input?.description ?? "",
    slug: slugify(title),
    theme: input?.theme ?? "signature",
    fields: input?.fields ?? [],
    cover_url: input?.cover_url ?? null,
    published: true,
    success_title: "Response received!",
    success_message: "Thank you for completing this form.",
    notify_owner: true,
    send_confirmation: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      const { data, error } = await supabase
        .from("forms")
        .insert({
          user_id: userId,
          title: newForm.title,
          description: newForm.description,
          slug: newForm.slug,
          theme: newForm.theme,
          fields: newForm.fields as never,
          published: newForm.published,
          success_title: newForm.success_title,
          success_message: newForm.success_message,
          notify_owner: newForm.notify_owner,
          send_confirmation: newForm.send_confirmation,
        })
        .select("*")
        .single();
      if (!error && data) return normalize(data as RawForm);
    }
  } catch {
    /* fallback to local */
  }

  const existing = getLocalForms();
  saveLocalForms([newForm, ...existing]);
  return newForm;
}

export async function updateForm(id: string, patch: Partial<FormRecord>): Promise<FormRecord> {
  try {
    const { data, error } = await supabase
      .from("forms")
      .update(patch as never)
      .eq("id", id)
      .select("*")
      .single();
    if (!error && data) return normalize(data as RawForm);
  } catch {
    /* fallback */
  }

  const existing = getLocalForms();
  const idx = existing.findIndex((f) => f.id === id);
  if (idx !== -1) {
    const updated = { ...existing[idx], ...patch, updated_at: new Date().toISOString() };
    existing[idx] = updated;
    saveLocalForms(existing);
    return updated;
  }
  throw new Error("Form not found");
}

export async function deleteForm(id: string) {
  try {
    await supabase.from("forms").delete().eq("id", id);
  } catch {
    /* fallback */
  }
  const existing = getLocalForms().filter((f) => f.id !== id);
  saveLocalForms(existing);
}

export async function listResponses(formId: string): Promise<ResponseRecord[]> {
  try {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });
    if (!error && data) return data as unknown as ResponseRecord[];
  } catch {
    /* fallback */
  }
  return getLocalResponses().filter((r) => r.form_id === formId);
}

export async function deleteResponse(id: string) {
  try {
    await supabase.from("responses").delete().eq("id", id);
  } catch {
    /* fallback */
  }
  const existing = getLocalResponses().filter((r) => r.id !== id);
  saveLocalResponses(existing);
}

export async function countResponses(formIds: string[]): Promise<Record<string, number>> {
  if (formIds.length === 0) return {};
  const counts: Record<string, number> = {};
  try {
    const { data, error } = await supabase.from("responses").select("form_id").in("form_id", formIds);
    if (!error && data) {
      for (const row of data as { form_id: string }[]) {
        counts[row.form_id] = (counts[row.form_id] ?? 0) + 1;
      }
      return counts;
    }
  } catch {
    /* fallback */
  }

  const localRes = getLocalResponses();
  for (const r of localRes) {
    if (formIds.includes(r.form_id)) {
      counts[r.form_id] = (counts[r.form_id] ?? 0) + 1;
    }
  }
  return counts;
}

export function saveLocalResponseDirect(formId: string, answers: Record<string, unknown>, email?: string | null) {
  const newRes: ResponseRecord = {
    id: `res_${Math.random().toString(36).slice(2, 11)}`,
    form_id: formId,
    data: answers,
    respondent_email: email ?? null,
    created_at: new Date().toISOString(),
  };
  const existing = getLocalResponses();
  saveLocalResponses([newRes, ...existing]);
  return newRes;
}

export function toCsv(fields: FormField[], responses: ResponseRecord[]): string {
  const header = ["Submitted at", ...fields.map((f) => f.label)];
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = responses.map((r) => [
    new Date(r.created_at).toISOString(),
    ...fields.map((f) => r.data?.[f.id]),
  ]);
  return [header.map(esc).join(","), ...rows.map((row) => row.map(esc).join(","))].join("\n");
}
