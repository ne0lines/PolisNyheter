export function normalizeBlockedWord(word) {
    return word.trim().toLowerCase();
}
export function parseBlockedWordsInput(value) {
    return value
        .split(/[\n,]/)
        .map(normalizeBlockedWord)
        .filter(Boolean);
}
export function stripHtml(value) {
    if (!value)
        return '';
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return doc.body.textContent?.trim() ?? '';
}
