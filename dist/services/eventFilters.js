export function matchesBlockedWords(event, blockedWords) {
    if (blockedWords.size === 0)
        return false;
    const haystack = `${event.title} ${event.summary} ${event.category}`.toLowerCase();
    for (const word of blockedWords) {
        if (word && haystack.includes(word))
            return true;
    }
    return false;
}
export function filterVisibleEvents(events, blockedWords, hiddenEventIds) {
    return events.filter(event => {
        if (hiddenEventIds.has(event.id))
            return false;
        if (matchesBlockedWords(event, blockedWords))
            return false;
        return true;
    });
}
