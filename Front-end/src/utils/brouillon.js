// Ajouter une couche de tuiles OpenStreetMap à la carte
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Dictionnaire pour stocker les polylignes des activités
const activityLayers = {};
//let activity = [];

// Fonction asynchrone pour charger et afficher les activités
async function loadActivitie(selectedFile) {
  try {
    const activityResponse = await fetch(
      `../src/data/activities_json/${selectedFile}`
    );
    const activity = await activityResponse.json();
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

// Fonction pour afficher une activité sur la carte sous forme de polyligne
function displayActivityOnMap(activity) {
  if (!activity.laps || activity.laps.length === 0) {
    console.error("Aucun lap trouvé pour l'activité:", activity);
    return;
  }

  const latlngs = activity.laps.flatMap((lap) =>
    lap.points
      ? lap.points.map((point) => [point.latitude, point.longitude])
      : []
  );

  if (latlngs.length === 0) {
    console.error("Aucun point trouvé pour l'activité:", activity);
    return;
  }

  // Déterminer la couleur de la polyligne en fonction du type d'activité
  let color;
  if (activity.sport === "Running") {
    color = "rgba(79, 127, 255, 0.7)"; // Bleu pour la course à pied
  } else if (activity.sport === "Biking") {
    color = "rgba(230, 144, 250, 0.7)"; // Rouge pour le vélo
  } else if (activity.sport === "Hiking") {
    color = "rgba(255, 206, 86, 0.7)"; // Vert pour la randonnée
  } else {
    color = "gray"; // Couleur par défaut pour les autres types
  }
  /*
      "rgba(79, 127, 255, 0.7)", // bleu
      "rgba(230, 144, 250, 0.7)", //rose
      "rgba(255, 99, 132, 0.7)", // rouge
      "rgba(75, 192, 192, 0.7)", // vert d’eau
      "rgba(255, 206, 86, 0.7)", // jaune
      "rgba(153, 102, 255, 0.7)", // violet
      "rgba(255, 159, 64, 0.7)", // orange*/
  // Créer une polyligne pour l'activité et l'ajouter à la carte
  const polyline = L.polyline(latlngs, { color: color }).addTo(map);

  // Stocker la polyligne dans le dictionnaire avec l'ID de l'activité comme clé
  activityLayers[activity.id] = polyline;
}

// Fonction pour centrer la carte sur une activité
function setMap(activity) {
  if (!activity.laps || activity.laps.length === 0) {
    console.error("Aucun lap trouvé pour l'activité:", activity);
    return;
  }

  // Récupérer tous les points GPS
  const allPoints = activity.laps.flatMap((lap) =>
    lap.points ? lap.points : []
  );

  if (allPoints.length === 0) {
    console.error("Aucun point trouvé pour l'activité:", activity);
    return;
  }

  // Utiliser le premier point comme centre
  const { latitude, longitude } = allPoints[0];

  if (latitude == null || longitude == null) {
    console.error("Premier point GPS invalide", allPoints[0]);
    return;
  }

  // Si la map existe déjà : recentrer
  if (window.map) {
    window.map.setView([latitude, longitude], 13);
    return;
  }

  // Sinon créer la carte
  window.map = L.map("map").setView([latitude, longitude], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(window.map);
}
