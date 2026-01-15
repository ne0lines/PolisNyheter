interface PoliceLocation {
  name: string;
  gps?: string;
}

interface PoliceEvent {
  id: number;
  datetime: string;
  name: string;
  summary: string;
  url: string;
  type: EventType;
  location: PoliceLocation;
  breaking?: boolean;
}

type EventType = "Incident" | "Trafik" | "Arbetsplatsolycka" | "Annat";

const mockEvents: PoliceEvent[] = [
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

async function fetchPoliceEvents(): Promise<PoliceEvent[]> {
  try {
    const response = await fetch('https://polisen.se/api/events');
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const data: any[] = await response.json();
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
      },
      breaking: new Date().getTime() - new Date(event.datetime).getTime() < 10 * 60 * 1000
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return mockEvents;
  }
}

function displayLatestNews(event: PoliceEvent): void {
  const latestNews = document.getElementById('latest-news');
  const newsContainerHeight = document.getElementById('news-container')?.style.height;
  if (!latestNews || !newsContainerHeight) return;

  const breakingLocation =  document.querySelector('.event-location');
  const breakingBadge = document.querySelector('.breaking-badge');
  const title = latestNews.querySelector('h2');
  const location = latestNews.querySelector('span.location');
  const summary = latestNews.querySelector('span.summary');
  const mapContainer = document.getElementById('mapContainer');
  const mapElement = document.getElementById('map');

  if(event.breaking){
    if (breakingLocation) breakingLocation.style.display = 'block';
    if (breakingLocation) breakingLocation.textContent = event.location.name;
    if (breakingBadge) breakingBadge.style.display = event.breaking ? 'block' : 'none';
    if (title) title.textContent = event.type + ':'; 
    if (summary) summary.textContent = event.summary;
  }
  else{
    if(breakingLocation) breakingLocation.style.display = 'none';
    if(title) title.textContent = event.type + ' i ' + event.location.name;
    if(summary) summary.textContent = event.summary;
  }
  if (mapContainer && mapElement && event.location.gps) {
    mapContainer.style.display = 'block';
    const [lat, lng] = event.location.gps.split(',').map(coord => parseFloat(coord.trim()));
    const map = L.map(mapElement).setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
      .bindPopup(event.type)
      .openPopup();

    mapElement.style.height = `calc(70dvh - ${newsContainerHeight})`;
  }

}

function createEventElement(event: PoliceEvent): HTMLElement {
  const article = document.createElement('li');
  const title = document.createElement('h3');
  title.textContent = event.type;
  article.appendChild(title);

  const summary = document.createElement('span');
  summary.className = 'event-summary';
  summary.textContent = event.summary;
  article.appendChild(summary);

  return article;
}

function displayEventTicker(events: PoliceEvent[]): void {
  const container = document.getElementById('ticker-list');
  if (!container) return;

  container.innerHTML = '';

  events.forEach(event => {
    const article = createEventElement(event);
    container.appendChild(article);
  });
}

const scrollers = document.querySelectorAll('#news-ticker');

function addAnimation() {
  scrollers.forEach(scroller => {
    const scrollerInner = scroller.querySelector('.scroller');
    const scrollerContent = Array.from(scrollerInner.children);
    scrollerContent.forEach(item => {
      const duplicatedItem = item.cloneNode(true);
      scrollerInner!.appendChild(duplicatedItem);
    });
  });
}

async function app(): Promise<void> {
  const events = await fetchPoliceEvents();
  events.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  const latest = events[0];
  const tickerEvents = events.slice(1, 11);

  if (latest) {
    displayLatestNews(latest);
  }
  displayEventTicker(tickerEvents);
  addAnimation();
}
app();
setInterval(app, 60 * 1000);