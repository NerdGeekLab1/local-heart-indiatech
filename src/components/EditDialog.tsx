import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onDelete?: () => void;
}

const EditDialog = ({ open, onClose, title, fields, initialData, onSave, onDelete }: EditDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      setFormData(initialData || fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {}));
    }
  }, [open, initialData, fields]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {f.label} {f.required && <span className="text-destructive">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                  value={formData[f.key] || ""}
                  onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                  required={f.required}
                />
              ) : f.type === "select" && f.options ? (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData[f.key] || ""}
                  onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                  required={f.required}
                >
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <Input
                  type={f.type || "text"}
                  value={formData[f.key] || ""}
                  onChange={e => setFormData(p => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                  required={f.required}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
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
