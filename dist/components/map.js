export function createMapController(elements) {
    let mapInstance = null;
    let mapMarker = null;
    const updateMap = (event) => {
        const { mapContainerEl, mapEl, newsContainerEl } = elements;
        if (!mapContainerEl || !mapEl)
            return;
        if (!event || !event.coordinates) {
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
        const [lat, lng] = event.coordinates.split(',').map(Number);
        if (!mapInstance) {
            mapInstance = L.map(mapEl).setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
        }
        else {
            mapInstance.setView([lat, lng], 13);
        }
        if (mapMarker) {
            mapMarker.remove();
        }
        mapMarker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(event.title).openPopup();
        mapInstance.invalidateSize();
    };
    return { updateMap };
}
