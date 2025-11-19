// src/pages/AdvancedStats.js

window.statsActivities = []; // toutes les activités chargées
let scatterChart = null;

window.selectedSport = "Running"; // sport par défaut
window.selectedPeriod = "all"; // période par défaut

// -------------------
// Initialisation
// -------------------
async function initAdvancedStatsPage() {
  const index_file = `/SportsData/Front-end/src/data/activities_json/index.json`;
  //const stats_file = `/SportsData/Front-end/src/data/stats.json`;
  window.statsActivities = await loadStats_indexFile(index_file);
  console.log("statsActivities", window.statsActivities);

  setupFilters();
  highlightActiveButtons();
  // ✅ Appel initial pour afficher les stats dès le chargement
  if (!window.selectedPeriod) window.selectedPeriod = "all";
  if (!window.selectedSport) window.selectedSport = "Running";

  updateFilteredActivities();

  populateStats(window.statsActivities);
}

document.addEventListener("DOMContentLoaded", initAdvancedStatsPage);
