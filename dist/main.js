import { renderAdminEventList, renderBlocklist } from './components/admin';
import { createMapController } from './components/map';
import { addAnimation, displayEventTicker, displayLatestNews } from './components/news';
import { filterVisibleEvents } from './services/eventFilters';
import { fetchSvtNews, mockNewsItems } from './services/svtNewsService';
import { loadStoredArray, saveStoredArray } from './utils/storage';
import { normalizeBlockedWord, parseBlockedWordsInput } from './utils/text';
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
const hiddenEventsStorageKey = 'obsnews.hiddenNewsIds';
const adminEventLimit = 20;
const mapController = createMapController({ mapContainerEl, mapEl, newsContainerEl });
let cachedNews = [];
const blockedWords = new Set(loadStoredArray(blockedWordsStorageKey, (value) => typeof value === 'string')
    .map(normalizeBlockedWord)
    .filter(Boolean));
const hiddenEventIds = new Set(loadStoredArray(hiddenEventsStorageKey, (value) => typeof value === 'number' && Number.isFinite(value)));
function persistBlockedWords() {
    saveStoredArray(blockedWordsStorageKey, Array.from(blockedWords).sort());
}
function persistHiddenEventIds() {
    saveStoredArray(hiddenEventsStorageKey, Array.from(hiddenEventIds).sort((a, b) => a - b));
}
function setBlocklistFeedback(message) {
    if (!blocklistFeedbackEl)
        return;
    blocklistFeedbackEl.textContent = message;
}
function renderNews(items) {
    const visibleItems = filterVisibleEvents(items, blockedWords, hiddenEventIds);
    const latest = visibleItems[0] ?? null;
    const tickerItems = visibleItems.slice(1, 11);
    displayLatestNews(latest, { latestNewsEl, breakingLocationEl, breakingBadgeEl }, mapController.updateMap);
    displayEventTicker(tickerItems, tickerListEl);
    addAnimation(document);
}
function renderFromCache() {
    renderNews(cachedNews);
    renderBlocklist(blocklistEl, blockedWords);
    renderAdminEventList(adminEventListEl, cachedNews, blockedWords, hiddenEventIds, adminEventLimit);
}
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
function handleClearHidden() {
    hiddenEventIds.clear();
    persistHiddenEventIds();
    renderFromCache();
}
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
async function app() {
    console.log('Initierar appen, hämtar data...');
    try {
        cachedNews = await fetchSvtNews();
    }
    catch (error) {
        console.error('Fel vid hämtning av SVT-nyheter', error);
        cachedNews = mockNewsItems;
    }
    cachedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    renderFromCache();
}
initializeAdmin();
app();
setInterval(app, 60000);
