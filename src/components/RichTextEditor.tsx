import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link2, Undo2, Eraser } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const cmd = (command: string, arg?: string) => document.execCommand(command, false, arg);

const TOOLS: { icon: typeof Bold; label: string; run: () => void }[] = [
  { icon: Bold, label: "Bold", run: () => cmd("bold") },
  { icon: Italic, label: "Italic", run: () => cmd("italic") },
  { icon: Heading2, label: "Heading", run: () => cmd("formatBlock", "<h2>") },
  { icon: Heading3, label: "Subheading", run: () => cmd("formatBlock", "<h3>") },
  { icon: List, label: "Bullet list", run: () => cmd("insertUnorderedList") },
  { icon: ListOrdered, label: "Numbered list", run: () => cmd("insertOrderedList") },
  { icon: Quote, label: "Quote", run: () => cmd("formatBlock", "<blockquote>") },
  {
    icon: Link2, label: "Link", run: () => {
      const url = window.prompt("Link URL");
      if (url) cmd("createLink", url);
    },
  },
  { icon: Eraser, label: "Clear formatting", run: () => cmd("removeFormat") },
  { icon: Undo2, label: "Undo", run: () => cmd("undo") },
];

/** Lightweight dependency-free rich text editor producing sanitized-ish HTML. */
const RichTextEditor = ({ value, onChange, placeholder, minHeight = 200 }: RichTextEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => onChange(ref.current?.innerHTML ?? "");

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/40 px-1.5 py-1">
        {TOOLS.map(t => (
          <button
            key={t.label}
            type="button"
            title={t.label}
            aria-label={t.label}
            onMouseDown={e => e.preventDefault()}
            onClick={() => { t.run(); emit(); }}
            className="p-1.5 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <t.icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        style={{ minHeight }}
        className="prose-sm max-w-none px-3 py-2 text-sm text-foreground outline-none [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
      />
    </div>
  );
};

export default RichTextEditor;
