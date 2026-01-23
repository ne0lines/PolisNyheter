import { hashStringToNumber } from '../utils/id';
import { stripHtml } from '../utils/text';
const rssUrl = 'https://www.svt.se/rss.xml';
const breakingWindowMs = 60 * 60 * 1000;
export const mockNewsItems = [
    {
        id: 1,
        title: 'Exempelnyhet från SVT',
        summary: 'Detta är en exempelnyhet för offline-läge.',
        link: 'https://www.svt.se/nyheter',
        publishedAt: '2024-01-01T12:00:00.000Z',
        category: 'Nyhet',
        breaking: false
    },
    {
        id: 2,
        title: 'Uppdatering: Viktig händelse',
        summary: 'Sammanfattning av en viktig händelse.',
        link: 'https://www.svt.se/nyheter',
        publishedAt: '2024-01-01T13:30:00.000Z',
        category: 'Senaste',
        breaking: true
    }
];
/** Convert a date string to ISO format. Inputs: raw date string. */
function toIsoDate(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date().toISOString();
    }
    return parsed.toISOString();
}
/** Parse a GeoRSS point into "lat,lng". Inputs: point string or null. */
function parseGeoPoint(value) {
    if (!value)
        return undefined;
    const parts = value.trim().split(/\s+/);
    if (parts.length < 2)
        return undefined;
    return `${parts[0]},${parts[1]}`;
}
/** Fetch and parse SVT RSS. Inputs: none; throws on HTTP or parse errors. */
export async function fetchSvtNews() {
    const response = await fetch(rssUrl);
    if (!response.ok) {
        throw new Error(`HTTP ERROR: ${response.status}`);
    }
    const xmlText = await response.text();
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Failed to parse RSS feed');
    }
    const items = Array.from(doc.querySelectorAll('item'));
    return items.map((item, index) => {
        const title = item.querySelector('title')?.textContent?.trim() || 'Okänd nyhet';
        const description = item.querySelector('description')?.textContent || '';
        const summary = stripHtml(description) || title;
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const guid = item.querySelector('guid')?.textContent?.trim() || link || title;
        const pubDateRaw = item.querySelector('pubDate')?.textContent?.trim() || '';
        const publishedAt = toIsoDate(pubDateRaw);
        const category = item.querySelector('category')?.textContent?.trim() || 'Nyhet';
        const geoPoint = item.querySelector('georss\\:point')?.textContent ?? null;
        const coordinates = parseGeoPoint(geoPoint);
        const idSeed = guid || `${title}-${pubDateRaw}-${index}`;
        const id = hashStringToNumber(idSeed);
        const breaking = Date.now() - new Date(publishedAt).getTime() < breakingWindowMs;
        return {
            id,
            title,
            summary,
            link,
            publishedAt,
            category,
            breaking,
            coordinates
        };
    });
}
