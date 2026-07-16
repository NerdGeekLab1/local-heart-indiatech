// Phone helpers: country codes + 10-digit local number validation.
export const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 IN +91" },
  { code: "+1", label: "🇺🇸 US +1" },
  { code: "+44", label: "🇬🇧 UK +44" },
  { code: "+61", label: "🇦🇺 AU +61" },
  { code: "+65", label: "🇸🇬 SG +65" },
  { code: "+971", label: "🇦🇪 AE +971" },
  { code: "+81", label: "🇯🇵 JP +81" },
  { code: "+49", label: "🇩🇪 DE +49" },
  { code: "+33", label: "🇫🇷 FR +33" },
  { code: "+86", label: "🇨🇳 CN +86" },
];

/** Split a stored E.164-ish string like "+91 9876543210" into parts. */
export const splitPhone = (val?: string | null): { code: string; number: string } => {
  const v = (val || "").trim();
  if (!v) return { code: "+91", number: "" };
  const m = v.match(/^(\+\d{1,3})[\s-]?(\d+)$/);
  if (m) return { code: m[1], number: m[2] };
  // Fallback: assume number only
  return { code: "+91", number: v.replace(/\D/g, "") };
};

export const joinPhone = (code: string, number: string) => {
  const digits = (number || "").replace(/\D/g, "");
  if (!digits) return "";
  return `${code} ${digits}`;
};

/** 10-digit local number validation (works for most supported countries here). */
export const isValidLocalPhone = (number: string) => /^\d{10}$/.test((number || "").replace(/\D/g, ""));
