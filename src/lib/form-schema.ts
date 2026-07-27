export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "date"
  | "single_select"
  | "multi_select"
  | "dropdown"
  | "rating"
  | "yes_no";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  help?: string;
  required: boolean;
  options?: string[];
}

export interface FieldMeta {
  type: FieldType;
  label: string;
  icon: string;
  hasOptions?: boolean;
  group: "text" | "choice" | "advanced";
}

export const FIELD_TYPES: FieldMeta[] = [
  { type: "short_text", label: "Short answer", icon: "Type", group: "text" },
  { type: "long_text", label: "Paragraph", icon: "AlignLeft", group: "text" },
  { type: "email", label: "Email", icon: "AtSign", group: "text" },
  { type: "number", label: "Number", icon: "Hash", group: "text" },
  { type: "phone", label: "Phone", icon: "Phone", group: "text" },
  { type: "url", label: "Website", icon: "Link", group: "text" },
  { type: "single_select", label: "Multiple choice", icon: "CircleDot", hasOptions: true, group: "choice" },
  { type: "multi_select", label: "Checkboxes", icon: "ListChecks", hasOptions: true, group: "choice" },
  { type: "dropdown", label: "Dropdown", icon: "ChevronDown", hasOptions: true, group: "choice" },
  { type: "yes_no", label: "Yes / No", icon: "ToggleLeft", group: "choice" },
  { type: "date", label: "Date", icon: "Calendar", group: "advanced" },
  { type: "rating", label: "Rating", icon: "Star", group: "advanced" },
];

export const FIELD_META: Record<FieldType, FieldMeta> = Object.fromEntries(
  FIELD_TYPES.map((f) => [f.type, f]),
) as Record<FieldType, FieldMeta>;

export type ThemeId =
  | "signature"
  | "minimal"
  | "midnight"
  | "sunset"
  | "forest"
  | "cyberpunk"
  | "lavender"
  | "emerald"
  | "paper"
  | "sapphire";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  swatch: string[];
}

export const THEMES: ThemeMeta[] = [
  {
    id: "signature",
    name: "Signature Flow",
    description: "Warm canvas with sky blue serif italic highlights",
    swatch: ["#FAF9F6", "#0284C7", "#0F172A"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Futuristic dark obsidian with glowing neon cyan & magenta",
    swatch: ["#090D16", "#00F0FF", "#FF007A"],
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    description: "Dreamy pastel violet glassmorphism with soft ambient glow",
    swatch: ["#F5F3FF", "#8B5CF6", "#C4B5FD"],
  },
  {
    id: "emerald",
    name: "Obsidian Emerald",
    description: "Dark luxury obsidian with luminous emerald mint signals",
    swatch: ["#06130D", "#10B981", "#34D399"],
  },
  {
    id: "sapphire",
    name: "Oceanic Sapphire",
    description: "Luminous deep ocean blue gradient with frosted ice card",
    swatch: ["#0B192C", "#38BDF8", "#1E293B"],
  },
  {
    id: "paper",
    name: "Editorial Kraft",
    description: "Warm vintage parchment paper, serif type & gold accents",
    swatch: ["#F7F4EA", "#D97706", "#451A03"],
  },
  {
    id: "sunset",
    name: "Sunset Amber",
    description: "Warm editorial serif, soft glowing amber",
    swatch: ["#FFF7ED", "#EA580C", "#9A3412"],
  },
  {
    id: "forest",
    name: "Forest Serenity",
    description: "Crisp natural sage green with deep pine accents",
    swatch: ["#F0FDF4", "#16A34A", "#14532D"],
  },
  {
    id: "midnight",
    name: "Midnight Ink",
    description: "Deep ink slate with electric royal blue signal",
    swatch: ["#0F172A", "#3B82F6", "#1E293B"],
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Crisp white paper with quiet, precise typography",
    swatch: ["#FFFFFF", "#0F172A", "#E2E8F0"],
  },
];


export function newFieldId() {
  return Math.random().toString(36).slice(2, 10);
}

export function createField(type: FieldType): FormField {
  const meta = FIELD_META[type];
  return {
    id: newFieldId(),
    type,
    label: meta.label === "Short answer" ? "Your question" : meta.label,
    required: false,
    options: meta.hasOptions ? ["Option 1", "Option 2", "Option 3"] : undefined,
  };
}

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "form"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isFieldAnswered(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function validateAnswer(field: FormField, value: unknown): string | null {
  const answered = isFieldAnswered(value);
  if (field.required && !answered) return "This question is required";
  if (!answered) return null;
  const str = String(value);
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return "Enter a valid email address";
  if (field.type === "url" && !/^https?:\/\/.+\..+/.test(str)) return "Enter a valid URL (https://…)";
  if (field.type === "number" && Number.isNaN(Number(str))) return "Enter a number";
  if (field.type === "phone" && !/^[0-9+()\-.\s]{6,}$/.test(str)) return "Enter a valid phone number";
  return null;
}
