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
