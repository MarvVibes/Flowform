import * as Icons from "lucide-react";
import type { FieldType } from "@/lib/form-schema";
import { FIELD_TYPES } from "@/lib/form-schema";

const groups: { id: "text" | "choice" | "advanced"; label: string }[] = [
  { id: "text", label: "Text & contact" },
  { id: "choice", label: "Choice" },
  { id: "advanced", label: "Other" },
];

export function FieldPalette({ onAdd }: { onAdd: (type: FieldType) => void }) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {FIELD_TYPES.filter((f) => f.group === group.id).map((meta) => {
              const Icon = (Icons[meta.icon as keyof typeof Icons] ?? Icons.Type) as React.ComponentType<{
                className?: string;
              }>;
              return (
                <button
                  key={meta.type}
                  type="button"
                  onClick={() => onAdd(meta.type)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left text-[13px] transition-all hover:-translate-y-px hover:border-foreground/25 hover:shadow-soft"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
