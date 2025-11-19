window.statsActivities = []; // toutes les activités chargées

window.selectedSport = "All"; // sport par défaut
window.selectedPeriod = "all"; // période par défaut

// -------------------
// Initialisation
// -------------------

async function initMainMenuPage() {
  const index_file = `/SportsData/Front-end/src/data/activities_json/index.json`;
  window.statsActivities = await loadStats_indexFile(index_file);
  //console.log("statsActivities", window.statsActivities);

  /*window.dataActivities = await loadData_indexFile(index_file);
  console.log("dataActivities", window.dataActivities);*/

  setupFilters();
  highlightActiveButtons();
  // ✅ Appel initial pour afficher les stats dès le chargement
  if (!window.selectedPeriod) window.selectedPeriod = "all";
  if (!window.selectedSport) window.selectedSport = "All";

  updateFilteredActivities();

  populateStats(window.statsActivities);
}

const stats_file_path = `../src/data/stats.json`;
document.addEventListener("DOMContentLoaded", initMainMenuPage);
