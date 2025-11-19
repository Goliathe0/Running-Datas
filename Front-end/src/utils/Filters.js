// -------------------
// Gestion des filtres de période
// -------------------
function setupFilters() {
  setupPeriodFilter();
  setupSportFilter();
}

function setupPeriodFilter() {
  const periodButtons = document.querySelectorAll(".filter-btn");
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedPeriod = btn.dataset.period;
      highlightActiveButtons();
      updateFilteredActivities();
    });
  });
}

// -------------------
// Gestion des filtres de sport
// -------------------
function setupSportFilter() {
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
// Application des filtres et mise à jour du graphique
// -------------------
function updateFilteredActivities() {
  const filtered = filterActivities();
  //console.log("filtered", filtered);
  updateScatterChart(filtered);
  const statsFiltered = getStatsFromActivities(filtered);
  //console.log("stats from getStatsFromActivities", stats);
  updateStatsDisplay(statsFiltered);
  populateStats(filtered);
}

function filterActivities() {
  //console.log("Activities passsée à filterActivities", window.statsActivities);
  /*console.log(
    "Selected sport/period:",
    window.selectedSport,
    window.selectedPeriod
  );*/

  // Guard : s'assurer que c'est bien un tableau
  if (!Array.isArray(window.statsActivities)) {
    console.warn(
      "filterActivities: window.statsActivities n'est pas un tableau."
    );
    return [];
  }

  const filtered = window.statsActivities
    .filter(
      (a) => window.selectedSport === "All" || a.sport === window.selectedSport
    ) // si la logique est true alors la valeur "passe" sinon elle est filtrée
    .filter((a) => isActivityInPeriod(a, window.selectedPeriod));

  //a ?? b          si a est défini, alors a,  si a n’est pas défini, alors b.

  //console.log("filtered in filterActivities()", filtered);
  //console.log("nbActivities", filtered.length);
  return filtered;
}

// Util : vérifie si une activité tombe dans la période demandée
function isActivityInPeriod(activity, period) {
  if (!activity || !activity.date) return false;
  if (!period || period === "all") return true;

  const now = new Date();
  const cutoff = new Date();

  switch (period) {
    case "year":
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
    case "6months":
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case "3months":
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case "1month":
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case "1week":
      cutoff.setMonth(now.getWeek() - 1);
      break;
    default:
      // si period inconnu, on loggue et on considère "aucune correspondance"
      console.warn("isActivityInPeriod: période inconnue:", period);
      return false;
  }

  // comparer dates
  return new Date(activity.date) >= cutoff;
}
// A supprimer si pas utilisée **
function filterByPeriod(activities, period) {
  const now = new Date();
  let cutoff = new Date();

  if (period === "all") {
    updateDateRange(cutoff, now); // Met à jour l’affichage
    return activities;
  }

  switch (period) {
    case "year":
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
    case "6months":
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case "3months":
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case "1month":
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case "1week":
      cutoff.setMonth(now.getWeek() - 3);
      break;
    //étoffer ou rendre flexible**
  }

  // Met à jour l'affichage
  updateDateRange(cutoff, now);

  return activities.filter((a) => new Date(a.date) >= cutoff);
}

Date.prototype.getWeek = function () {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDayOfYear) / 86400000; // Milliseconds in a day
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};
const now = new Date();
//console.log("semaine :", now.getWeek()); // Outputs the current week number

function updateDateRange(startDate, endDate) {
  const rangeEl = document.getElementById("dateRange");
  if (!rangeEl) return;

  // Formate les dates au format YYYY-MM-DD
  const start = formatDateISOtoFR(startDate.toISOString()); //.split("T")[0];
  const end = formatDateISOtoFR(endDate.toISOString()); //.split("T")[0];

  rangeEl.textContent = `Période : du ${start} au ${end}`;
}

function updateStatsDisplay(stats) {
  //console.log("updateStatsDisplay → stats:", stats);

  // Sécurité : s'assurer que "stats" existe
  if (!stats) {
    console.warn("updateStatsDisplay: aucun objet stats fourni");
    return;
  }

  // Liste des éléments potentiels à mettre à jour
  const mapping = {
    nbActivitiesFiltered: stats.nbActivities,
    distanceTotaleFiltered: stats.distanceTotale?.toFixed(2) + " km",
    distanceMoyenneFiltered: stats.distanceMoyenne?.toFixed(2) + " km",
    avgSpeedFiltered: stats.vitesseMoyenne?.toFixed(2) + " km/h",
    tempsTotalFiltered: formatTime(stats.tempsTotal),
    denivelePFiltered: stats.denivelePTotal?.toFixed(0) + " m",
    deniveleNFiltered: stats.deniveleNtotal?.toFixed(0) + " m",
  };

  // Mise à jour dynamique : uniquement les éléments existants sur la page
  for (const [id, value] of Object.entries(mapping)) {
    const element = document.getElementById(id);
    if (element && value !== undefined && !Number.isNaN(value)) {
      element.textContent = value;
    }
  }
}
