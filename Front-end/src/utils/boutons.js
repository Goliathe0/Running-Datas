function setupButtons() {
  setupPeriodButton();
  setupSportButton();
  setupLapsModeButton();
}

// -------------------
// Gestion des filtres d'activités
// -------------------

function setupPeriodButton() {
  const periodButtons = document.querySelectorAll(".filter-btn");
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.selectedPeriod = btn.dataset.period;
      highlightActiveButtons();
      updateFilteredActivities();
    });
  });
}

function setupSportButton() {
  const sportButtons = document.querySelectorAll(".chart-button");
  sportButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.selectedSport = btn.dataset.sport;
      highlightActiveButtons();
      updateFilteredActivities();
    });
  });
}

// -------------------
// Gestion des choix de mode
// -------------------

function setupLapsModeButton() {
  const modeButtons = document.querySelectorAll(".laps-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.selectedMode = btn.dataset.mode;
      highlightActiveButtons();
      //l'action quand on clique sur le bouton :
      fillActivityTable(window.selectedFile, window.selectedMode);
    });
  });
}

// -------------------
// Mise à jour du style des boutons actifs
// -------------------
function highlightActiveButtons() {
  // Boutons de sport
  document.querySelectorAll(".chart-button").forEach((btn) => {
    if (btn.dataset.sport === window.selectedSport) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Boutons de période
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.period === window.selectedPeriod) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Boutons de mode pour laps
  document.querySelectorAll(".laps-btn").forEach((btn) => {
    if (btn.dataset.mode === window.selectedMode) {
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
