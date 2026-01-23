export function normalizeBlockedWord(word: string): string {
  return word.trim().toLowerCase();
}

export function parseBlockedWordsInput(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map(normalizeBlockedWord)
    .filter(Boolean);
}

export function stripHtml(value: string): string {
  if (!value) return '';
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return doc.body.textContent?.trim() ?? '';
}
