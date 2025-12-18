// src/pages/activity.js

window.selectedMode = "auto"; // sport par défaut

async function initActivityPage() {
  window.selectedFile = localStorage.getItem("selectedActivityFile");

  if (!selectedFile) {
    console.warn("Aucun fichier sélectionné.");
    return;
  }

  console.log("Fichier sélectionné :", window.selectedFile);

  await loadActivitie(window.selectedFile);
  await populateHeader(window.selectedFile);
  await populateStats(window.selectedFile);

  setupButtons();
  if (!window.selectedMode) window.selectedMode = "auto";
  highlightActiveButtons();

  await fillActivityTable(window.selectedFile, window.selectedMode);
}
// Lance l’initialisation quand la page est prête
document.addEventListener("DOMContentLoaded", initActivityPage);
