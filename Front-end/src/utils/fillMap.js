// ----------------------------------------------------------------------------
//  Map Leaflet - Gestion de l'affichage d'une activité
// ----------------------------------------------------------------------------

// La map Leaflet globale
window.leafletMap = null;

// ----------------------------------------------------------------------------
//  Création / récupération de la carte
// ----------------------------------------------------------------------------
function ensureMap() {
  console.log("ensureMap executée");
  if (window.leafletMap) return window.leafletMap;

  window.leafletMap = L.map("map", {
    zoomControl: true,
  }).setView([48.8566, 2.3522], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(window.leafletMap);

  // Afficher les coordonnées sous le curseur
  window.leafletMap.on("mousemove", function (e) {
    const lat = e.latlng.lat.toFixed(6);
    const lon = e.latlng.lng.toFixed(6);

    const info = document.getElementById("coords");
    if (info) {
      info.textContent = `Lat : ${lat} | Lon : ${lon}`;
    }
  });
  setTimeout(() => {
    window.leafletMap.invalidateSize();
  }, 20);

  return window.leafletMap;
}

// ----------------------------------------------------------------------------
//  Chargement d’une activité JSON
// ----------------------------------------------------------------------------
async function loadActivitie(selectedFile) {
  try {
    const res = await fetch(`../src/data/activities_json/${selectedFile}`);
    const activity = await res.json();

    setMap(activity);
    displayActivityOnMap(activity);
  } catch (error) {
    console.error(
      "Erreur lors du chargement de l'activité:",
      selectedFile,
      error
    );
  }
}

// ----------------------------------------------------------------------------
//  Dégradé de couleur vitesse (min → max)
// ----------------------------------------------------------------------------
function colorForSpeed(sport, min, max, value) {
  //console.log("sport", sport);
  let t = 0;
  let r = 255;
  let g = 159;
  let b = 64;
  if (sport === "Running") {
    if (max <= min) return "rgba(79, 127, 255, 0.7)"; // bleu
    t = (value - min) / (max - min); // 0 → 1
    // Interpolation entre bleu clair (189, 206, 255) et bleu foncé (0, 0, 255)
    r = Math.round(189 + (0 - 189) * t);
    g = Math.round(206 + (0 - 206) * t);
    b = Math.round(255 + (255 - 255) * t);
  } else if (sport === "Biking") {
    if (max <= min) return "rgba(230, 144, 250, 0.7)"; // rose

    t = (value - min) / (max - min); // 0 → 1
    // Interpolation entre rose clair (255,204,241) et rose foncé (255, 0, 200)
    r = Math.round(255 + (255 - 255) * t);
    g = Math.round(204 + (0 - 204) * t);
    b = Math.round(241 + (200 - 241) * t);
  } else if (sport === "Hiking") {
    if (max <= min) return "rgba(255, 206, 86, 0.7)"; // jaune

    t = (value - min) / (max - min); // 0 → 1
    // Interpolation entre jaune clair (255,225,148) et jaune foncé (255, 206, 86)
    r = Math.round(255 + (255 - 255) * t);
    g = Math.round(225 + (206 - 225) * t);
    b = Math.round(148 + (86 - 148) * t);
  } else {
    r = 255;
    g = 159;
    b = 64;
  }
  return `rgb(${r},${g},${b})`;
}
function colorForSpeed2(sport) {
  //console.log("sport", sport);

  if (sport === "Running") {
    return "rgba(79, 127, 255, 0.7)"; // bleu
  } else if (sport === "Biking") {
    return "rgba(230, 144, 250, 0.7)"; // rose
  } else if (sport === "Hiking") {
    return "rgba(255, 206, 86, 0.7)"; // jaune
  } else {
    return "rgba(255,159,64,0.7)";
  }
}
// ----------------------------------------------------------------------------
//  Initialisation simple de la map (fitBounds fera le vrai centrage)
// ----------------------------------------------------------------------------
function setMap(activity) {
  const allPoints = activity.laps?.flatMap((l) => l.points || []) || [];

  if (!allPoints.length) {
    console.error("Aucun point GPS trouvé pour l'activité");
    return;
  }

  ensureMap(); // juste s'assurer qu'elle existe
}

// ----------------------------------------------------------------------------
//  Affichage du parcours complet + couleurs vitesse
// ----------------------------------------------------------------------------
function displayActivityOnMap(activity) {
  const map = ensureMap();
  const laps = activity.laps || [];

  const points = laps.flatMap((l) => l.points || []);
  if (points.length < 2) {
    console.error("Pas assez de points pour tracer une activité");
    return;
  }

  // --------------------------------------------------------------------------
  //  Récupération vitesse min / max
  // --------------------------------------------------------------------------
  const speeds = points.map((p) => Number(p.speed)).filter((v) => !isNaN(v));

  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);

  // --------------------------------------------------------------------------
  //  Construction des segments colorés selon la vitesse
  // --------------------------------------------------------------------------
  const segmentLayers = [];

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];

    if (
      p1.latitude == null ||
      p1.longitude == null ||
      p2.latitude == null ||
      p2.longitude == null ||
      p1.latitude == 0 ||
      p1.longitude == 0 ||
      p2.latitude == 0 ||
      p2.longitude == 0
    )
      continue;

    const speed = Number(p2.speed); // vitesse fournie par ton JSON

    const color = colorForSpeed(activity.sport, minSpeed, maxSpeed, speed);
    const latlngs = [
      [Number(p1.latitude), Number(p1.longitude)],
      [Number(p2.latitude), Number(p2.longitude)],
    ];

    const seg = L.polyline(latlngs, {
      color,
      weight: 4,
      opacity: 0.7,
      //renderer: L.canvas(),
    }).addTo(map);

    segmentLayers.push(seg);
  }

  // --------------------------------------------------------------------------
  //  FitBounds automatique sur tous les points
  // --------------------------------------------------------------------------
  const validPoints = points.filter(
    (p) =>
      p.latitude !== 0 &&
      p.longitude !== 0 &&
      p.latitude != null &&
      p.longitude != null
  );

  const bounds = L.latLngBounds(
    validPoints.map((p) => [Number(p.latitude), Number(p.longitude)])
  );

  // --------------------------------------------------------------------------
  //  Markers départ / arrivée
  // --------------------------------------------------------------------------
  const first = points[0];
  const last = points[points.length - 1];
  /*

  //.bindPopup("Je suis un marqueur.");
*/
  var StartIcon = L.icon({
    iconUrl: "../icons/Bike.png",
    iconSize: [40, 40],
  });
  const EndIcon = L.divIcon({
    className: "end-icon",
    html: `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 18 18"
         fill="currentColor">
      <path d="M18.11,5.18a11.23,11.23,0,0,0-3.17.07,9.06,9.06,0,0,1-3.16,0A3.88,3.88,0,0,1,9.23,3c-.15.44-.31.87-.47,1.31L5.7,12.88,2.94,20.59,4,21l2.49-6.94a3.33,3.33,0,0,0,1.76,1,9.06,9.06,0,0,0,3.16,0,11.16,11.16,0,0,1,3.16-.07,3.85,3.85,0,0,1,2.83,2.29l3.54-9.88A3.86,3.86,0,0,0,18.11,5.18ZM18.24,11a3.79,3.79,0,0,0-1.77-.9c-.23.64-.45,1.27-.68,1.9a3.88,3.88,0,0,1,1.77.9l-.63,1.75a3.65,3.65,0,0,0-1.77-.9L15.79,12A9.55,9.55,0,0,0,13.72,12c-.21.59-.41,1.17-.62,1.75l-2.17.2c.21-.58.42-1.16.62-1.74a8.89,8.89,0,0,1-2.06-.07l-.63,1.74A3.7,3.7,0,0,1,7.09,13l.63-1.74a3.74,3.74,0,0,0,1.77.9c.22-.63.45-1.27.68-1.9a3.74,3.74,0,0,1-1.77-.9c.23-.64.45-1.27.68-1.9a3.83,3.83,0,0,0,1.77.9c.21-.59.41-1.17.62-1.75a8.43,8.43,0,0,0,2.07.07c-.21.58-.42,1.16-.62,1.75l2.16-.21.63-1.74a8.37,8.37,0,0,1,2.06.07c-.2.58-.41,1.16-.62,1.74a3.79,3.79,0,0,1,1.77.9C18.69,9.77,18.47,10.41,18.24,11Z"
            transform="translate(-2.94 -3)"/>
      <path d="M12.2,10.28c-.23.63-.46,1.27-.68,1.9.72-.06,1.44-.15,2.16-.21.23-.63.46-1.26.68-1.9C13.64,10.13,12.92,10.22,12.2,10.28Z"
            transform="translate(-2.94 -3)"/>
      <path d="M12.2,10.28c.23-.64.45-1.27.68-1.9a9.55,9.55,0,0,1-2.07-.07l-.68,1.9A9.55,9.55,0,0,0,12.2,10.28Z"
            transform="translate(-2.94 -3)"/>
      <path d="M15.05,8.17l-.69,1.9a9.55,9.55,0,0,1,2.07.07c.23-.63.46-1.27.68-1.9A8.89,8.89,0,0,0,15.05,8.17Z"
            transform="translate(-2.94 -3)"/>
    </svg>
  `,
    iconSize: [40, 40],
    iconAnchor: [1, 40],
  });

  //popupAnchor: [0, -38] // Position du popup par rapport à l'icône

  L.marker([first.latitude, first.longitude], { icon: StartIcon }).addTo(map);
  L.marker([last.latitude, last.longitude], { icon: EndIcon }).addTo(map);

  console.log("Bounds:", bounds.toBBoxString());
  console.log("Bounds is valid ?", bounds.isValid());
  console.log("Nombre de points:", points.length);
  console.log("Map size:", map.getSize());

  setTimeout(() => {
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [20, 20] });
  }, 50);
}

// ----------------------------------------------------------------------------
//  Export des fonctions si nécessaire
// ----------------------------------------------------------------------------
window.loadActivitie = loadActivitie;

async function fillMap(index_file_path) {
  console.log("fillMap executée");
  console.log("index_file_path", index_file_path);
  try {
    const response = await fetch(index_file_path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json_files = await response.json();

    const map = ensureMap();
    const allBounds = [];

    for (const item of json_files) {
      const file = `/SportsData/Front-end/src/data/activities_json/${item.filename}`;

      // Charger le JSON de l’activité
      const res = await fetch(file);
      if (!res.ok) {
        console.warn("Impossible de charger :", file);
        continue;
      }
      const activity = await res.json();

      // Utiliser tes fonctions existantes
      const allPoints = activity.laps?.flatMap((l) => l.points || []) || [];

      if (!allPoints.length) {
        console.error("Aucun point GPS trouvé pour l'activité");
        return;
      }

      // Affichage sur la map : tracer uniquement le parcours,
      // car displayActivityOnMap() recentre (fitBounds) à chaque activité.
      // Donc on va utiliser uniquement le *traceur* interne.
      drawActivitySegments(activity, map, allBounds);
    }

    // -------------------------------------------------------------------------
    //  FitBounds sur toutes les activités combinées
    // -------------------------------------------------------------------------
    if (allBounds.length > 0) {
      const bounds = L.latLngBounds(allBounds);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  } catch (err) {
    console.error("Erreur dans fillMap():", err);
  }
}

// -----------------------------------------------------------------------------
//  Tracer une activité SANS recadrage automatique
// -----------------------------------------------------------------------------
function drawActivitySegments(activity, map, allBounds) {
  const laps = activity.laps || [];
  const points = laps.flatMap((l) => l.points || []);
  if (points.length < 2) return;

  const speeds = points.map((p) => Number(p.speed)).filter((v) => !isNaN(v));
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);

  // Segments
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];

    if (
      p1.latitude == null ||
      p1.longitude == null ||
      p2.latitude == null ||
      p2.longitude == null ||
      p1.latitude == 0 ||
      p1.longitude == 0 ||
      p2.latitude == 0 ||
      p2.longitude == 0
    )
      continue;

    const speed = Number(p2.speed);
    const color = colorForSpeed2(activity.sport);
    const latlngs = [
      [Number(p1.latitude), Number(p1.longitude)],
      [Number(p2.latitude), Number(p2.longitude)],
    ];

    L.polyline(latlngs, { color, weight: 4, opacity: 0.9 }).addTo(map);
    allBounds.push([p1.latitude, p1.longitude], [p2.latitude, p2.longitude]);
  }
}
