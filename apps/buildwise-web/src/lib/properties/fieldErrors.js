export function getVirtualTourUrlFieldError(value) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length > 2000) {
    return "Virtual tour URL must be 2000 characters or less.";
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Enter a valid URL (including https://), or clear the field.";
    }
    return "";
  } catch {
    return "Enter a valid URL (including https://), or clear the field.";
  }
}
