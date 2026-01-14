// Interfaces
interface PoliceLocation {
  name: string;
  gps?: string; // optional
}

interface PoliceEvent {
  id: number;
  datetime: string;
  name: string;
  summary: string;
  url: string;
  type: EventType;
  location: PoliceLocation;
}

type EventType = "Incident" | "Traffic" | "Other";

// Mock data (for testing, but we'll use API)
const mockEvents: PoliceEvent[] = [
  {
    id: 1,
    datetime: "2023-10-01T10:00:00",
    name: "Trafikolycka",
    summary: "En bilolycka på E4.",
    url: "https://polisen.se/1",
    type: "Traffic",
    location: { name: "Stockholm" }
  },
  {
    id: 2,
    datetime: "2023-10-02T15:00:00",
    name: "Inbrott",
    summary: "Inbrott i villa.",
    url: "https://polisen.se/2",
    type: "Incident",
    location: { name: "Göteborg", gps: "57.7089,11.9746" }
  }
];

// Function to fetch from API
async function fetchPoliceEvents(): Promise<PoliceEvent[]> {
  try {
    const response = await fetch('https://polisen.se/api/events');
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const data: any[] = await response.json();
    // Map to our interface
    return data.map(event => ({
      id: event.id,
      datetime: event.datetime,
      name: event.name,
      summary: event.summary,
      url: event.url,
      type: event.type as EventType,
      location: {
        name: event.location.name,
        gps: event.location.gps
      }
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return mockEvents; // fallback to mock
  }
}

// Function to display events
function displayEvents(events: PoliceEvent[]) {
  const container = document.getElementById('news-container') as HTMLDivElement;
  container.innerHTML = '';
  events.forEach(event => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <h2>${event.name}</h2>
      <p>${event.summary}</p>
      <p>Plats: ${event.location.name}</p>
      <p>Tid: ${new Date(event.datetime).toLocaleString('sv-SE')}</p>
      <a href="${event.url}" target="_blank">Läs mer</a>
    `;
    container.appendChild(div);
  });
}

// Main function
async function main() {
  const events = await fetchPoliceEvents();
  displayEvents(events);
}

main();