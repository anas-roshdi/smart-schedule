export function normalizeArabic(input: string): string {
  return (input || "")
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function matchesName(name: string, query: string): boolean {
  const tokens = normalizeArabic(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const n = normalizeArabic(name);
  return tokens.every((t) => n.includes(t));
}
