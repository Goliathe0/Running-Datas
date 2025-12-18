// src/pages/Map.js

async function initMapPage() {
  const index_file_path = `/SportsData/Front-end/src/data/activities_json/index.json`;

  await fillMap(index_file_path);
}
// Lance l’initialisation quand la page est prête
document.addEventListener("DOMContentLoaded", initMapPage);
