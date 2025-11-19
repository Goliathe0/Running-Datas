// -------------------
// Gestion des filtres
// -------------------
function setupFiltersButtons() {
  const filtersButtons = document.querySelectorAll(".chart-button");
  filtersButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSport = btn.dataset.sport;
      highlightActiveButtons();
      updateFilteredChart();
    });
  });
}

// -------------------
// Mise à jour du style des boutons actifs
// -------------------
function highlightActiveButtons() {
  // Boutons de sport
  document.querySelectorAll(".chart-button").forEach((btn) => {
    if (btn.dataset.sport === selectedSport) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Boutons de période
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.period === selectedPeriod) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

//------------------
//Gestion boutons navigation
//------------------

document.addEventListener("DOMContentLoaded", () => {
  const mainMenuBtn = document.querySelector(".btn-mainMenu");
  const activitiesBtn = document.querySelector(".btn-activities");
  const statsBtn = document.querySelector(".btn-stats");
  const recordsBtn = document.querySelector(".btn-records");
  const carteBtn = document.querySelector(".btn-carte");

  if (mainMenuBtn) {
    mainMenuBtn.addEventListener("click", () => {
      window.location.href = "MainMenu.html";
    });
  }

  if (activitiesBtn) {
    activitiesBtn.addEventListener("click", () => {
      window.location.href = "Activities.html"; // même onglet
      // ou window.open("Activities.html", "_blank"); // nouvel onglet
    });
  }

  if (recordsBtn) {
    recordsBtn.addEventListener("click", () => {
      window.location.href = "Records.html";
    });
  }

  if (carteBtn) {
    carteBtn.addEventListener("click", () => {
      window.location.href = "Map.html";
    });
  }
  if (statsBtn) {
    statsBtn.addEventListener("click", () => {
      window.location.href = "AdvancedStats.html";
    });
  }
});
