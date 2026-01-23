/** Render the latest headline area. Inputs: event (or null), UI elements, map update callback. */
export function displayLatestNews(event, elements, updateMap) {
    const { latestNewsEl, breakingLocationEl, breakingBadgeEl } = elements;
    if (!latestNewsEl)
        return;
    const titleEl = latestNewsEl.querySelector('h2');
    const summaryEl = latestNewsEl.querySelector('span.summary');
    if (!event) {
        if (breakingLocationEl)
            breakingLocationEl.style.display = 'none';
        if (breakingBadgeEl)
            breakingBadgeEl.style.display = 'none';
        if (titleEl)
            titleEl.textContent = 'No news to display';
        if (summaryEl)
            summaryEl.textContent = 'Try adjusting filters or check back later.';
        updateMap(null);
        return;
    }
    const isBreaking = Boolean(event.breaking);
    if (breakingLocationEl)
        breakingLocationEl.style.display = isBreaking ? 'block' : 'none';
    if (breakingLocationEl)
        breakingLocationEl.textContent = isBreaking ? event.location.name : '';
    if (breakingBadgeEl)
        breakingBadgeEl.style.display = isBreaking ? 'block' : 'none';
    if (titleEl) {
        titleEl.textContent = isBreaking ? `${event.type}:` : `${event.type} i ${event.location.name}`;
    }
    if (summaryEl)
        summaryEl.textContent = event.summary;
    updateMap(isBreaking ? event : null);
}
/** Create a ticker list item. Inputs: a PoliceEvent item. */
export function createEventElement(event) {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    title.textContent = event.type;
    li.appendChild(title);
    const summary = document.createElement('span');
    summary.className = 'event-summary';
    summary.textContent = event.summary;
    li.appendChild(summary);
    return li;
}
/** Render the ticker list. Inputs: events array and ticker list element. */
export function displayEventTicker(events, tickerListEl) {
    if (!tickerListEl)
        return;
    tickerListEl.innerHTML = '';
    events.forEach(event => tickerListEl.appendChild(createEventElement(event)));
}
/** Duplicate ticker items for scrolling animation. Inputs: root node to search within. */
export function addAnimation(scrollerRoot = document) {
    const scrollers = scrollerRoot.querySelectorAll('#news-ticker');
    scrollers.forEach(scroller => {
        const scrollerInner = scroller.querySelector('.scroller');
        if (scrollerInner) {
            Array.from(scrollerInner.children).forEach(item => {
                scrollerInner.appendChild(item.cloneNode(true));
            });
        }
    });
}
