let map;
let startMarker = null;
let isoLayer = null;

function initMap() {
  map = L.map("map").setView([46.5, 2.5], 6);

  // Fond de plan (OSM pour le dev, tu pourras passer sur WMTS IGN)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  map.on("click", onMapClick);
}

function onMapClick(e) {
  const { lat, lng } = e.latlng;

  if (startMarker) {
    map.removeLayer(startMarker);
  }

  startMarker = L.marker([lat, lng]).addTo(map);

  const popupContent = `
    <form id="iso-form">
      <label>Profil :</label>
      <select name="profile">
        <option value="car">Voiture</option>
        <option value="pedestrian">Piéton</option>
      </select><br/>
      <label>Type :</label>
      <select name="costType">
        <option value="time">Temps (sec)</option>
        <option value="distance">Distance (m)</option>
      </select><br/>
      <label>Valeur :</label>
      <input type="number" name="costValue" value="600"/><br/>
      <label>Direction :</label>
      <select name="direction">
        <option value="departure">Départ</option>
        <option value="arrival">Arrivée</option>
      </select><br/>
      <button type="submit">Calculer</button>
    </form>
  `;

  startMarker.bindPopup(popupContent).openPopup();
}

document.addEventListener("submit", async (event) => {
  if (event.target.id === "iso-form") {
    event.preventDefault();

    if (!startMarker) return;

    const form = event.target;
    const profile = form.profile.value;
    const costType = form.costType.value;
    const costValue = form.costValue.value;
    const direction = form.direction.value;

    const latlng = startMarker.getLatLng();
    const point = `${latlng.lng},${latlng.lat}`;

    try {
      const response = await fetch("/api/isochrone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ point, profile, costType, costValue, direction })
      });

      if (!response.ok) {
        console.error("Erreur API isochrone", response.status);
        return;
      }

      const geojson = await response.json();

      if (isoLayer) {
        map.removeLayer(isoLayer);
      }

      isoLayer = L.geoJSON(geojson).addTo(map);
      map.fitBounds(isoLayer.getBounds());
    } catch (err) {
      console.error("Erreur réseau", err);
    }
  }
});

window.addEventListener("load", initMap);
