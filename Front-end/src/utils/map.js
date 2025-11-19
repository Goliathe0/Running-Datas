// ----------------------------------------------------------------------------
//  Map Leaflet - Gestion de l'affichage d'une activité
// ----------------------------------------------------------------------------

// La map Leaflet globale
window.leafletMap = null;

// ----------------------------------------------------------------------------
//  Création / récupération de la carte
// ----------------------------------------------------------------------------
function ensureMap() {
  if (window.leafletMap) return window.leafletMap;

  window.leafletMap = L.map("map", {
    zoomControl: true,
  }).setView([48.8566, 2.3522], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(window.leafletMap);

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
      p2.longitude == null
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
      opacity: 0.9,
    }).addTo(map);

    segmentLayers.push(seg);
  }

  // --------------------------------------------------------------------------
  //  FitBounds automatique sur tous les points
  // --------------------------------------------------------------------------
  const bounds = L.latLngBounds(
    points.map((p) => [Number(p.latitude), Number(p.longitude)])
  );

  map.fitBounds(bounds, { padding: [20, 20] });

  // --------------------------------------------------------------------------
  //  Markers départ / arrivée
  // --------------------------------------------------------------------------
  const first = points[0];
  const last = points[points.length - 1];

  L.marker([first.latitude, first.longitude], {
    title: "Départ",
  }).addTo(map);

  L.marker([last.latitude, last.longitude], {
    title: "Arrivée",
  }).addTo(map);
}

// ----------------------------------------------------------------------------
//  Export des fonctions si nécessaire
// ----------------------------------------------------------------------------
window.loadActivitie = loadActivitie;
