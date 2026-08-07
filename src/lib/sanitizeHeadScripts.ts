/**
 * Sanitizer for CUSTOM_HEAD_SCRIPTS.
 *
 * Allows only a small whitelist of head-safe tags and attributes.
 * Strips event handlers (on*), javascript:/data:/vbscript: URLs,
 * and any unknown tag.
 *
 * Returns { html, warnings } — `html` is the sanitized markup that is
 * safe to inject; `warnings` is a list of human-readable notes about
 * what was removed, suitable for showing in the admin UI.
 */
export interface SanitizeResult {
  html: string;
  warnings: string[];
}

const ALLOWED_TAGS = new Set(["script", "meta", "link", "style", "noscript"]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  script: new Set(["src", "async", "defer", "type", "nonce", "crossorigin", "integrity", "id"]),
  meta: new Set(["name", "content", "property", "charset", "http-equiv"]),
  link: new Set(["rel", "href", "type", "as", "crossorigin", "sizes", "media", "integrity"]),
  style: new Set(["type", "media", "nonce"]),
  noscript: new Set([]),
};

const SAFE_URL_RE = /^(https?:|\/\/|\/|#|mailto:|tel:)/i;
const UNSAFE_URL_RE = /^(javascript|data|vbscript):/i;

const isSafeUrl = (v: string) => {
  const t = v.trim();
  if (!t) return true;
  if (UNSAFE_URL_RE.test(t)) return false;
  if (t.startsWith("data:")) return false;
  return SAFE_URL_RE.test(t) || !/^[a-z]+:/i.test(t);
};

export const sanitizeHeadScripts = (raw: string): SanitizeResult => {
  const warnings: string[] = [];
  if (!raw || !raw.trim()) return { html: "", warnings };

  // Use the browser parser. SSR not relevant here (admin UI + runtime only).
  const doc = new DOMParser().parseFromString(`<head>${raw}</head>`, "text/html");
  const head = doc.head;
  const out: string[] = [];

  const walk = (node: Element) => {
    const tag = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      warnings.push(`Removed disallowed tag <${tag}>`);
      return;
    }
    const allowed = ALLOWED_ATTRS[tag];
    // Strip every event handler + unsafe attribute + unknown attribute
    Array.from(node.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) {
        warnings.push(`Removed event handler ${name} from <${tag}>`);
        node.removeAttribute(attr.name);
        return;
      }
      if (!allowed.has(name)) {
        warnings.push(`Removed unsupported attribute ${name} on <${tag}>`);
        node.removeAttribute(attr.name);
        return;
      }
      if ((name === "src" || name === "href") && !isSafeUrl(attr.value)) {
        warnings.push(`Removed unsafe URL in ${name} on <${tag}>`);
        node.removeAttribute(attr.name);
      }
    });

    // For <script>, require a src OR plain inline JS — strip dangerous srcs already done above.
    // Reject inline <script> that contain `</script` injected sequences (defensive).
    if (tag === "script") {
      const text = node.textContent || "";
      if (/<\/script/i.test(text)) {
        warnings.push("Removed <script> with embedded </script tokens");
        return;
      }
    }

    // For <style>, drop @import url(javascript:...) etc.
    if (tag === "style") {
      const text = (node.textContent || "");
      if (/expression\s*\(|javascript:|vbscript:/i.test(text)) {
        warnings.push("Removed <style> containing unsafe expressions");
        return;
      }
    }

    out.push(node.outerHTML);
  };

  Array.from(head.children).forEach(child => walk(child as Element));
  return { html: out.join("\n"), warnings };
};
