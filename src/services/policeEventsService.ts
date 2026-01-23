import type { EventType, PoliceEvent } from '../models/PoliceEvent';

const breakingWindowMs = 10 * 60 * 1000;

export const mockEvents: PoliceEvent[] = [
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

/** Fetch events from the Polisen API. Inputs: none; throws on HTTP error. */
export async function fetchPoliceEvents(): Promise<PoliceEvent[]> {
  const response = await fetch('https://polisen.se/api/events');
  if (!response.ok) {
    throw new Error(`HTTP ERROR: ${response.status}`);
  }

  const data: any[] = await response.json();
  return data.map(event => ({
    id: event.id,
    datetime: event.datetime,
    name: event.name,
    summary: event.summary,
    url: event.url,
    type: event.type as EventType,
    location: { name: event.location.name, gps: event.location.gps },
    breaking: Date.now() - new Date(event.datetime).getTime() < breakingWindowMs
  }));
}
