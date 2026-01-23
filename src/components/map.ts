import type { PoliceEvent } from '../models/PoliceEvent.js';

declare const L: any;

interface MapElements {
  mapContainerEl: HTMLElement | null;
  mapEl: HTMLElement | null;
  newsContainerEl: HTMLElement | null;
}

/** Create a map controller. Inputs: map container, map element, and news container. */
export function createMapController(elements: MapElements) {
  let mapInstance: any | null = null;
  let mapMarker: any | null = null;

  /** Update the map based on an event. Inputs: PoliceEvent with gps or null to hide map. */
  const updateMap = (event: PoliceEvent | null): void => {
    const { mapContainerEl, mapEl, newsContainerEl } = elements;
    if (!mapContainerEl || !mapEl) return;

    if (!event || !event.location.gps) {
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
    const aspectHeight = (window.innerWidth * 9) / 16;
    const vh = window.innerHeight / 100;
    const newsHeight = newsContainerEl?.offsetHeight || 0;
    const mapHeight = aspectHeight - vh - newsHeight;
    mapEl.style.height = `${mapHeight}px`;

    const [lat, lng] = event.location.gps.split(',').map(Number);
    if (!mapInstance) {
      mapInstance = L.map(mapEl).setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
    } else {
      mapInstance.setView([lat, lng], 13);
    }

    if (mapMarker) {
      mapMarker.remove();
    }
    mapMarker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(event.type).openPopup();
    mapInstance.invalidateSize();
  };

  return { updateMap };
}
