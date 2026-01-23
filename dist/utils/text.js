/** Normalize a word for matching. Inputs: raw word string. */
export function normalizeBlockedWord(word) {
    return word.trim().toLowerCase();
}
/** Parse blocklist input into tokens. Inputs: raw input string. */
export function parseBlockedWordsInput(value) {
    return value
        .split(/[\n,]/)
        .map(normalizeBlockedWord)
        .filter(Boolean);
}
/** Strip HTML tags and return text content. Inputs: HTML string. */
export function stripHtml(value) {
    if (!value)
        return '';
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return doc.body.textContent?.trim() ?? '';
}
