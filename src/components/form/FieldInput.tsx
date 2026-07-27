import { useState } from "react";
import type { FormField } from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface Props {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string | null;
  disabled?: boolean;
}

const inputBase =
  "w-full bg-transparent px-4 py-3 text-[15px] outline-none transition-shadow placeholder:opacity-50 focus:ring-2";

function shellStyle(error?: string | null): React.CSSProperties {
  return {
    borderRadius: "var(--form-radius)",
    border: `1px solid ${error ? "#EF4444" : "var(--form-border)"}`,
    background: "var(--form-input-bg, var(--form-panel))",
    color: "var(--form-ink)",
  };
}


export function FieldInput({ field, value, onChange, error, disabled }: Props) {
  const [focused, setFocused] = useState(false);
  const id = `field-${field.id}`;
  const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  const common = {
    id,
    disabled,
    "aria-required": field.required,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy || undefined,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className: inputBase,
    style: {
      ...shellStyle(error),
      boxShadow: focused ? `0 0 0 3px color-mix(in oklab, var(--form-accent) 22%, transparent)` : undefined,
    } as React.CSSProperties,
  };

  const selected = Array.isArray(value) ? (value as string[]) : [];

  switch (field.type) {
    case "long_text":
      return (
        <textarea
          {...common}
          rows={4}
          placeholder={field.placeholder ?? "Type your answer…"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "dropdown":
      return (
        <select
          {...common}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "single_select":
    case "yes_no": {
      const options = field.type === "yes_no" ? ["Yes", "No"] : (field.options ?? []);
      return (
        <div role="radiogroup" aria-labelledby={`${id}-label`} className="grid gap-2">
          {options.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => onChange(active ? "" : opt)}
                className="flex items-center gap-3 px-4 py-3 text-left text-[15px] transition-all hover:opacity-90"
                style={{
                  ...shellStyle(error),
                  borderColor: active ? "var(--form-accent)" : "var(--form-border)",
                  boxShadow: active
                    ? "0 0 0 2px color-mix(in oklab, var(--form-accent) 28%, transparent)"
                    : undefined,
                }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: active ? "var(--form-accent)" : "var(--form-border)" }}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full" style={{ background: "var(--form-accent)" }} />
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    case "multi_select":
      return (
        <div className="grid gap-2">
          {(field.options ?? []).map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                role="checkbox"
                aria-checked={active}
                disabled={disabled}
                onClick={() =>
                  onChange(active ? selected.filter((v) => v !== opt) : [...selected, opt])
                }
                className="flex items-center gap-3 px-4 py-3 text-left text-[15px] transition-all hover:opacity-90"
                style={{
                  ...shellStyle(error),
                  borderColor: active ? "var(--form-accent)" : "var(--form-border)",
                }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border"
                  style={{
                    borderColor: active ? "var(--form-accent)" : "var(--form-border)",
                    background: active ? "var(--form-accent)" : "transparent",
                  }}
                >
                  {active && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" style={{ color: "var(--form-accent-ink)" }}>
                      <path d="M2 6.5L4.5 9L10 3.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      );

    case "rating": {
      const current = Number(value) || 0;
      return (
        <div className="flex gap-1.5" role="radiogroup" aria-label={field.label}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={current === n}
              aria-label={`${n} out of 5`}
              disabled={disabled}
              onClick={() => onChange(current === n ? "" : n)}
              className={cn(
                "rounded-md p-1.5 transition-transform hover:scale-110 focus-visible:outline-2",
                current >= n ? "opacity-100" : "opacity-35",
              )}
              style={{ color: "var(--form-accent)" }}
            >
              <Star className="h-7 w-7" fill={current >= n ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      );
    }

    default: {
      const inputType =
        field.type === "email"
          ? "email"
          : field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : field.type === "phone"
                ? "tel"
                : field.type === "url"
                  ? "url"
                  : "text";
      return (
        <input
          {...common}
          type={inputType}
          placeholder={field.placeholder ?? (field.type === "date" ? undefined : "Type your answer…")}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
  }
}
