import type { NewsItem } from '../models/NewsItem';

export function matchesBlockedWords(event: NewsItem, blockedWords: Set<string>): boolean {
  if (blockedWords.size === 0) return false;
  const haystack = `${event.title} ${event.summary} ${event.category}`.toLowerCase();
  for (const word of blockedWords) {
    if (word && haystack.includes(word)) return true;
  }
  return false;
}

export function filterVisibleEvents(
  events: NewsItem[],
  blockedWords: Set<string>,
  hiddenEventIds: Set<number>
): NewsItem[] {
  return events.filter(event => {
    if (hiddenEventIds.has(event.id)) return false;
    if (matchesBlockedWords(event, blockedWords)) return false;
    return true;
  });
}
