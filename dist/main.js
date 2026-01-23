import { renderAdminEventList, renderBlocklist } from './components/admin.js';
import { createMapController } from './components/map.js';
import { addAnimation, displayEventTicker, displayLatestNews } from './components/news.js';
import { filterVisibleEvents } from './services/eventFilters.js';
import { fetchPoliceEvents, mockEvents } from './services/policeEventsService.js';
import { loadStoredArray, saveStoredArray } from './utils/storage.js';
import { normalizeBlockedWord, parseBlockedWordsInput } from './utils/text.js';
const latestNewsEl = document.getElementById('latest-news');
const breakingLocationEl = document.querySelector('.event-location');
const breakingBadgeEl = document.querySelector('.breaking-badge');
const tickerListEl = document.getElementById('ticker-list');
const mapContainerEl = document.getElementById('mapContainer');
const mapEl = document.getElementById('map');
const newsContainerEl = document.getElementById('news-container');
const blocklistFormEl = document.getElementById('blocklist-form');
const blocklistInputEl = document.getElementById('blocklist-input');
const blocklistFeedbackEl = document.getElementById('blocklist-feedback');
const blocklistEl = document.getElementById('blocklist');
const adminEventListEl = document.getElementById('admin-event-list');
const clearHiddenButtonEl = document.getElementById('clear-hidden');
const blockedWordsStorageKey = 'obsnews.blockedWords';
const hiddenEventsStorageKey = 'obsnews.hiddenEventIds';
const adminEventLimit = 20;
const mapController = createMapController({ mapContainerEl, mapEl, newsContainerEl });
let cachedEvents = [];
const blockedWords = new Set(loadStoredArray(blockedWordsStorageKey, (value) => typeof value === 'string')
    .map(normalizeBlockedWord)
    .filter(Boolean));
const hiddenEventIds = new Set(loadStoredArray(hiddenEventsStorageKey, (value) => typeof value === 'number' && Number.isFinite(value)));
/** Persist blocked words to localStorage. Inputs: none; uses current blockedWords set. */
function persistBlockedWords() {
    saveStoredArray(blockedWordsStorageKey, Array.from(blockedWords).sort());
}
/** Persist hidden event IDs to localStorage. Inputs: none; uses current hiddenEventIds set. */
function persistHiddenEventIds() {
    saveStoredArray(hiddenEventsStorageKey, Array.from(hiddenEventIds).sort((a, b) => a - b));
}
/** Update the blocklist feedback text. Inputs: message string for the UI. */
function setBlocklistFeedback(message) {
    if (!blocklistFeedbackEl)
        return;
    blocklistFeedbackEl.textContent = message;
}
/** Render latest news and ticker. Inputs: full event list (sorted) to filter and render. */
function renderNews(events) {
    const visibleEvents = filterVisibleEvents(events, blockedWords, hiddenEventIds);
    const latest = visibleEvents[0] ?? null;
    const tickerEvents = visibleEvents.slice(1, 11);
    displayLatestNews(latest, { latestNewsEl, breakingLocationEl, breakingBadgeEl }, mapController.updateMap);
    displayEventTicker(tickerEvents, tickerListEl);
    addAnimation(document);
}
/** Render all UI sections from cached data. Inputs: none; uses cachedEvents and filters. */
function renderFromCache() {
    renderNews(cachedEvents);
    renderBlocklist(blocklistEl, blockedWords);
    renderAdminEventList(adminEventListEl, cachedEvents, blockedWords, hiddenEventIds, adminEventLimit);
}
/** Handle blocklist form submit. Inputs: submit event from blocklist form. */
function handleBlocklistSubmit(event) {
    event.preventDefault();
    if (!blocklistInputEl)
        return;
    const words = parseBlockedWordsInput(blocklistInputEl.value);
    if (!words.length) {
        setBlocklistFeedback('Add at least one word to block.');
        return;
    }
    let added = 0;
    words.forEach(word => {
        if (!blockedWords.has(word)) {
            blockedWords.add(word);
            added += 1;
        }
    });
    if (added === 0) {
        setBlocklistFeedback('Those words are already blocked.');
    }
    else {
        setBlocklistFeedback(`Added ${added} word${added === 1 ? '' : 's'}.`);
    }
    blocklistInputEl.value = '';
    persistBlockedWords();
    renderFromCache();
}
/** Handle clicks on the blocklist remove buttons. Inputs: click event from the list. */
function handleBlocklistClick(event) {
    const target = event.target;
    if (!target)
        return;
    const removeButton = target.closest('button[data-action="remove"]');
    if (!removeButton)
        return;
    const item = removeButton.closest('li');
    const word = item?.dataset.word;
    if (!word)
        return;
    blockedWords.delete(word);
    persistBlockedWords();
    setBlocklistFeedback(`Removed "${word}".`);
    renderFromCache();
}
/** Handle hide/show toggles in the admin list. Inputs: click event from list container. */
function handleAdminEventListClick(event) {
    const target = event.target;
    if (!target)
        return;
    const actionButton = target.closest('button[data-action="toggle-hidden"]');
    if (!actionButton)
        return;
    const card = actionButton.closest('.admin-event');
    const idStr = card?.dataset.id;
    if (!idStr)
        return;
    const id = Number(idStr);
    if (!Number.isFinite(id))
        return;
    if (hiddenEventIds.has(id)) {
        hiddenEventIds.delete(id);
    }
    else {
        hiddenEventIds.add(id);
    }
    persistHiddenEventIds();
    renderFromCache();
}
/** Clear all hidden IDs. Inputs: none; resets hiddenEventIds set. */
function handleClearHidden() {
    hiddenEventIds.clear();
    persistHiddenEventIds();
    renderFromCache();
}
/** Initialize admin UI and event listeners. Inputs: none; uses DOM elements. */
function initializeAdmin() {
    renderBlocklist(blocklistEl, blockedWords);
    renderAdminEventList(adminEventListEl, [], blockedWords, hiddenEventIds, adminEventLimit);
    if (blocklistFormEl)
        blocklistFormEl.addEventListener('submit', handleBlocklistSubmit);
    if (blocklistEl)
        blocklistEl.addEventListener('click', handleBlocklistClick);
    if (adminEventListEl)
        adminEventListEl.addEventListener('click', handleAdminEventListClick);
    if (clearHiddenButtonEl)
        clearHiddenButtonEl.addEventListener('click', handleClearHidden);
}
/** Fetch events and render the UI. Inputs: none; handles errors and falls back to mock data. */
async function app() {
    console.log('Initierar appen, hämtar data...');
    try {
        cachedEvents = await fetchPoliceEvents();
    }
    catch (error) {
        console.error('Fel vid hämtning av events', error);
        cachedEvents = mockEvents;
    }
    cachedEvents.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    renderFromCache();
}
initializeAdmin();
app();
setInterval(app, 60000);
