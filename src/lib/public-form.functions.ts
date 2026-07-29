import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { FormField, ThemeId } from "./form-schema";

export interface PublicForm {
  id: string;
  slug: string;
  title: string;
  description: string;
  theme: ThemeId;
  fields: FormField[];
  coverUrl: string | null;
}


export const getPublicFormBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<PublicForm | null> => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "";
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data: rows, error } = await supabase
      .from("forms")
      .select("id, slug, title, description, theme, fields, cover_url")
      .eq("slug", data.slug)
      .eq("published", true)
      .limit(1);

    if (error) throw new Error("Could not load this form.");
    const row = rows?.[0];
    if (!row) return null;

    const coverPath = (row as { cover_url?: string | null }).cover_url ?? null;
    let coverUrl: string | null = null;
    if (coverPath) {
      const signed = await supabase.storage
        .from("flyers")
        .createSignedUrl(coverPath, 60 * 60 * 24);
      coverUrl = signed.data?.signedUrl ?? null;
    }

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      theme: (row.theme || "minimal") as ThemeId,
      fields: Array.isArray(row.fields) ? (row.fields as unknown as FormField[]) : [],
      coverUrl,
    };
  });

