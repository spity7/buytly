// Small display helpers shared by the Block 57 public pages.

const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z"“'‘(])/;

/**
 * Opening sentence(s) of verified copy, kept verbatim: sentences are added
 * until the excerpt reaches `minLength` characters. "205 sqm. to 215 sqm."
 * stays intact (a break needs a capital letter after it).
 */
export function leadingSentences(text, minLength = 90) {
  const sentences = String(text ?? "")
    .trim()
    .split(SENTENCE_BREAK);
  let excerpt = "";
  for (const sentence of sentences) {
    excerpt = excerpt ? `${excerpt} ${sentence}` : sentence;
    if (excerpt.length >= minLength) break;
  }
  return excerpt;
}

/** 3 → "03" (editorial figures). */
export function twoDigits(value) {
  return String(value).padStart(2, "0");
}

/** Zero-based index → "01", "02" … (editorial index numbers). */
export function indexLabel(index) {
  return twoDigits(index + 1);
}

/**
 * Live availability line for a list of public units:
 *   some available → "3 of 4 available" · all sold → `soldOut`
 *   nothing listed → `empty` (callers pass "Availability on request").
 */
export function formatAvailabilityCount(
  { available = 0, total = 0 } = {},
  { empty, soldOut } = {},
) {
  if (!total) return empty;
  if (!available && soldOut) return soldOut;
  return `${available} of ${total} available`;
}
