import type { PoliceEvent } from '../models/PoliceEvent.js';

type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
  invalidateSize: () => void;
};

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (text: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
  remove: () => void;
};

type LeafletTileLayer = {
  addTo: (map: LeafletMap) => void;
};

type LeafletLike = {
  map: (el: HTMLElement) => LeafletMap;
  tileLayer: (url: string) => LeafletTileLayer;
  marker: (coords: [number, number]) => LeafletMarker;
};

declare const L: LeafletLike;

interface MapElements {
  mapContainerEl: HTMLElement | null;
  mapEl: HTMLElement | null;
  newsContainerEl: HTMLElement | null;
}

/** Create a map controller. Inputs: map container, map element, and news container. */
export function createMapController(elements: MapElements) {
  let mapInstance: LeafletMap | null = null;
  let mapMarker: LeafletMarker | null = null;

  /** Update the map based on an event. Inputs: PoliceEvent with gps or null to hide map. */
  const updateMap = (event: PoliceEvent | null): void => {
    const { mapContainerEl, mapEl, newsContainerEl } = elements;
    if (!mapContainerEl || !mapEl) return;

    if (!event || !event.location.gps) {
      // Hide and fully reset map when no location is available.
      mapContainerEl.style.display = 'none';
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        mapMarker = null;
        mapEl.innerHTML = '';
      }
      return;
    }

    mapContainerEl.style.display = 'block';
    // Resize map to fit within the 16:9 canvas minus the news block.
    const aspectHeight = (window.innerWidth * 9) / 16;
    const vh = window.innerHeight / 100;
    const newsHeight = newsContainerEl?.offsetHeight || 0;
    const mapHeight = aspectHeight - vh - newsHeight;
    mapEl.style.height = `${mapHeight}px`;

    const [lat, lng] = event.location.gps.split(',').map(Number);
    if (!mapInstance) {
      // Create the map once, then reuse it across updates.
      mapInstance = L.map(mapEl).setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
    } else {
      mapInstance.setView([lat, lng], 13);
    }

    if (mapMarker) {
      mapMarker.remove();
    }
    // Replace the marker to match the current event.
    mapMarker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(event.type).openPopup();
    mapInstance.invalidateSize();
  };

  return { updateMap };
}
