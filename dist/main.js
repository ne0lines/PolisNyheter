"use strict";
const mockEvents = [
    {
        id: 1,
        datetime: "2023-10-01T10:00:00",
        name: "Trafikolycka",
        summary: "En bilolycka på E4.",
        url: "https://polisen.se/1",
        type: "Trafik",
        location: { name: "Stockholm" },
        breaking: true
    },
    {
        id: 2,
        datetime: "2023-10-02T15:00:00",
        name: "Inbrott",
        summary: "Inbrott i villa.",
        url: "https://polisen.se/2",
        type: "Incident",
        location: { name: "Göteborg", gps: "57.7089,11.9746" },
        breaking: false
    },
    {
        id: 3,
        datetime: "2023-10-03T08:30:00",
        name: "Brand",
        summary: "Brand i flerfamiljshus.",
        url: "https://polisen.se/3",
        type: "Annat",
        location: { name: "Malmö" },
        breaking: true
    }
];
const latestNewsEl = document.getElementById('latest-news');
const breakingLocationEl = document.querySelector('.event-location');
const breakingBadgeEl = document.querySelector('.breaking-badge');
const tickerListEl = document.getElementById('ticker-list');
const mapContainerEl = document.getElementById('mapContainer');
const mapEl = document.getElementById('map');
const canvasEl = document.getElementById('canvas');
const newsContainerEl = document.getElementById('news-container');
async function fetchPoliceEvents() {
    try {
        const response = await fetch('https://polisen.se/api/events');
        if (!response.ok)
            throw new Error('Failed to fetch');
        const data = await response.json();
        return data.map(event => ({
            id: event.id,
            datetime: event.datetime,
            name: event.name,
            summary: event.summary,
            url: event.url,
            type: event.type,
            location: { name: event.location.name, gps: event.location.gps },
            breaking: Date.now() - new Date(event.datetime).getTime() < 600000
        }));
    }
    catch (error) {
        console.error('Error fetching events:', error);
        return mockEvents;
    }
}
function displayLatestNews(event) {
    if (!latestNewsEl)
        return;
    const titleEl = latestNewsEl.querySelector('h2');
    const summaryEl = latestNewsEl.querySelector('span.summary');
    if (event.breaking) {
        if (breakingLocationEl)
            breakingLocationEl.style.display = 'block';
        if (breakingLocationEl)
            breakingLocationEl.textContent = event.location.name;
        if (breakingBadgeEl)
            breakingBadgeEl.style.display = 'block';
        if (mapContainerEl)
            mapContainerEl.style.display = 'block';
        if (titleEl)
            titleEl.textContent = `${event.type}:`;
        if (summaryEl)
            summaryEl.textContent = event.summary;
    }
    else {
        if (breakingLocationEl)
            breakingLocationEl.style.display = 'none';
        if (breakingBadgeEl)
            breakingBadgeEl.style.display = 'none';
        if (mapContainerEl)
            mapContainerEl.style.display = 'none';
        if (titleEl)
            titleEl.textContent = `${event.type} i ${event.location.name}`;
        if (summaryEl)
            summaryEl.textContent = event.summary;
    }
    if (mapContainerEl && mapEl && event.location.gps) {
        const aspectHeight = (window.innerWidth * 9) / 16;
        const vh = window.innerHeight / 100;
        const newsHeight = newsContainerEl?.offsetHeight || 0;
        const mapHeight = aspectHeight - vh - newsHeight;
        mapEl.style.height = `${mapHeight}px`;
        const [lat, lng] = event.location.gps.split(',').map(Number);
        const map = L.map(mapEl).setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.marker([lat, lng]).addTo(map).bindPopup(event.type).openPopup();
        map.invalidateSize();
    }
}
function createEventElement(event) {
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
function displayEventTicker(events) {
    if (!tickerListEl)
        return;
    tickerListEl.innerHTML = '';
    events.forEach(event => tickerListEl.appendChild(createEventElement(event)));
}
function addAnimation() {
    const scrollers = document.querySelectorAll('#news-ticker');
    scrollers.forEach(scroller => {
        const scrollerInner = scroller.querySelector('.scroller');
        if (scrollerInner) {
            Array.from(scrollerInner.children).forEach(item => {
                scrollerInner.appendChild(item.cloneNode(true));
            });
        }
    });
}
async function app() {
    const events = await fetchPoliceEvents();
    events.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    const latest = events[0];
    const tickerEvents = events.slice(1, 11);
    if (latest)
        displayLatestNews(latest);
    displayEventTicker(tickerEvents);
    addAnimation();
}
app();
setInterval(app, 60000);
