export function substitutePlaceholders(
  html: string,
  placeholders: Record<string, string>
): string {
  return html.replace(/\{(\w+)\}/g, (_, key) => {
    return placeholders[key] ?? `{${key}}`; // Leave as is if not found
  });
}
