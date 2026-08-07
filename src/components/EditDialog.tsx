import { useState, useEffect, useMemo } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";
import { readingTime, stripHtml } from "@/lib/structuredData";

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "richtext" | "tags" | "date" | "checkbox" | "url";
  /** Dropdown values. With `allowCustom`, the user can also type a new value. */
  options?: string[];
  allowCustom?: boolean;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** Auto-fills from another field (e.g. read time derived from the body). */
  deriveFrom?: string;
  derive?: (source: string) => string;
  full?: boolean;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onDelete?: () => void;
  wide?: boolean;
}

const CUSTOM = "__custom__";

const EditDialog = ({ open, onClose, title, description, fields, initialData, onSave, onDelete, wide }: EditDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const base = fields.reduce<Record<string, any>>((acc, f) => {
      acc[f.key] = f.type === "checkbox" ? false : "";
      return acc;
    }, {});
    const merged = { ...base, ...(initialData || {}) };
    fields.forEach(f => {
      if (f.type === "tags" && Array.isArray(merged[f.key])) merged[f.key] = merged[f.key].join(", ");
    });
    setFormData(merged);
    setCustomOpen({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const bodyKey = useMemo(() => fields.find(f => f.type === "richtext")?.key, [fields]);
  const wordCount = bodyKey ? stripHtml(String(formData[bodyKey] || "")).split(" ").filter(Boolean).length : 0;

  if (!open) return null;

  const set = (key: string, value: any) => setFormData(p => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    fields.forEach(f => {
      if (f.deriveFrom && !String(payload[f.key] || "").trim()) {
        const src = String(payload[f.deriveFrom] || "");
        payload[f.key] = (f.derive ?? readingTime)(src);
      }
    });
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card rounded-xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between gap-3 p-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md" aria-label="Close">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid gap-4 sm:grid-cols-2">
          {fields.map(f => {
            const isFull = f.full || f.type === "textarea" || f.type === "richtext" || f.type === "tags";
            const usingCustom = customOpen[f.key];
            return (
              <div key={f.key} className={`space-y-1.5 ${isFull ? "sm:col-span-2" : ""}`}>
                <label className="text-sm font-medium text-foreground flex items-center justify-between gap-2">
                  <span>{f.label} {f.required && <span className="text-destructive">*</span>}</span>
                  {f.type === "richtext" && <span className="text-[11px] font-normal text-muted-foreground">{wordCount} words · ~{readingTime(String(formData[f.key] || ""))} read</span>}
                </label>

                {f.type === "richtext" ? (
                  <RichTextEditor value={String(formData[f.key] || "")} onChange={v => set(f.key, v)} placeholder={f.placeholder || "Write here…"} />
                ) : f.type === "textarea" ? (
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                    value={formData[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={e => set(f.key, e.target.value)}
                    required={f.required}
                  />
                ) : f.type === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="accent-primary" checked={!!formData[f.key]} onChange={e => set(f.key, e.target.checked)} />
                    {f.hint || "Enable"}
                  </label>
                ) : f.type === "select" && f.options ? (
                  usingCustom ? (
                    <Input autoFocus value={formData[f.key] ?? ""} placeholder="Type a new value"
                      onChange={e => set(f.key, e.target.value)} required={f.required} />
                  ) : (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={f.options.includes(String(formData[f.key])) ? String(formData[f.key]) : formData[f.key] ? CUSTOM : ""}
                      onChange={e => {
                        if (e.target.value === CUSTOM) { setCustomOpen(p => ({ ...p, [f.key]: true })); set(f.key, ""); }
                        else set(f.key, e.target.value);
                      }}
                      required={f.required}
                    >
                      <option value="">Select…</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      {f.allowCustom && <option value={CUSTOM}>+ Add new…</option>}
                    </select>
                  )
                ) : f.type === "tags" ? (
                  <Input value={formData[f.key] ?? ""} placeholder={f.placeholder || "comma, separated, tags"}
                    onChange={e => set(f.key, e.target.value)} />
                ) : (
                  <Input
                    type={f.type === "date" ? "date" : f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                    value={formData[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={e => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    required={f.required}
                  />
                )}

                {f.hint && f.type !== "checkbox" && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                {f.deriveFrom && !String(formData[f.key] || "").trim() && (
                  <p className="text-xs text-primary">Auto: {(f.derive ?? readingTime)(String(formData[f.deriveFrom] || ""))}</p>
                )}
              </div>
            );
          })}

          <div className="sm:col-span-2 flex gap-2 pt-2 sticky bottom-0 bg-card pb-1">
            <Button type="submit" className="flex-1 gap-2 rounded-full">
              <Save className="w-4 h-4" /> Save
            </Button>
            {onDelete && (
              <Button type="button" variant="destructive" onClick={() => { onDelete(); onClose(); }} className="gap-2 rounded-full">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDialog;
