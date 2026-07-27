import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Sparkles, Copy } from "lucide-react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import type { FormField } from "@/lib/form-schema";
import { FIELD_META } from "@/lib/form-schema";
import { cn } from "@/lib/utils";

interface Props {
  field: FormField;
  index: number;
  selected: boolean;
  improving: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onImprove: () => void;
}

export function SortableFieldCard({
  field,
  index,
  selected,
  improving,
  onSelect,
  onDelete,
  onDuplicate,
  onImprove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const meta = FIELD_META[field.type];
  const Icon = (Icons[meta.icon as keyof typeof Icons] ?? Icons.Type) as React.ComponentType<{
    className?: string;
  }>;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border bg-card p-3.5 transition-colors",
        selected ? "border-signal shadow-soft" : "border-border hover:border-foreground/20",
        isDragging && "z-20 opacity-90 shadow-lift",
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-current={selected}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab touch-none rounded p-1 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label={`Reorder ${field.label}`}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
          <span className="text-muted-foreground/60">· {index + 1}</span>
        </div>
        <p className="mt-1 truncate text-[15px] font-medium">
          {field.label}
          {field.required && <span className="ml-1 text-signal">*</span>}
        </p>
        {field.help && <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{field.help}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <IconButton label="Improve with AI" onClick={onImprove} disabled={improving}>
          <Sparkles className={cn("h-4 w-4", improving && "animate-pulse text-signal")} />
        </IconButton>
        <IconButton label="Duplicate question" onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
        </IconButton>
        <IconButton label="Delete question" onClick={onDelete} danger>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </motion.div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
        danger && "hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}
