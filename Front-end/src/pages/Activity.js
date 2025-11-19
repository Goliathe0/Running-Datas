// src/pages/activity.js

async function initActivityPage() {
  const selectedFile = localStorage.getItem("selectedActivityFile");

  if (!selectedFile) {
    console.warn("Aucun fichier sélectionné.");
    return;
  }

  console.log("Fichier sélectionné :", selectedFile);

  await loadActivitie(selectedFile);
  await populateHeader(selectedFile);
  await populateStats(selectedFile);
  //await fillAltitudeChart(selectedFile);
  //await fillSpeedHrChart(selectedFile);
}

// Lance l’initialisation quand la page est prête
document.addEventListener("DOMContentLoaded", initActivityPage);
