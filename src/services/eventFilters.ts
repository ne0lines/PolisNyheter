import type { PoliceEvent } from '../models/PoliceEvent.js';

/** Check if an event matches any blocked words. Inputs: event and blocked word set. */
export function matchesBlockedWords(event: PoliceEvent, blockedWords: Set<string>): boolean {
  if (blockedWords.size === 0) return false;
  const haystack = `${event.name} ${event.summary} ${event.type} ${event.location.name}`.toLowerCase();
  for (const word of blockedWords) {
    if (word && haystack.includes(word)) return true;
  }
  return false;
}

/** Filter events based on blocked words and hidden IDs. Inputs: events array and filter sets. */
export function filterVisibleEvents(
  events: PoliceEvent[],
  blockedWords: Set<string>,
  hiddenEventIds: Set<number>
): PoliceEvent[] {
  return events.filter(event => {
    if (hiddenEventIds.has(event.id)) return false;
    if (matchesBlockedWords(event, blockedWords)) return false;
    return true;
  });
}
