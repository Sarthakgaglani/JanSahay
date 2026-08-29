export function parseDocuments(documents) {
  if (!documents) return [];

  const items = documents
    .replace(/\r/g, '\n')
    .split(/\n+|(?=\s+\d+\.\s+)/)
    .map((item) => item.replace(/^\s*(?:\d+\.|[-•])\s*/, '').trim())
    .filter(Boolean);

  return items.length ? items : [documents.trim()];
}
