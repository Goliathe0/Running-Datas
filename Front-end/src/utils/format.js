// Fonction pour formater la durée en hh:mm:ss VALIDE
function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  // Formater les heures, minutes et secondes pour qu'elles aient toujours deux chiffres
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  // Retourner le format approprié en fonction de la durée
  if (hours > 0) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

// Fonction pour calculer la vitesse ou l'allure en fonction du type d'activité  VALIDE
function calculateSpeedOrPace(sport, totalDistance, totalDuration, format) {
  if (totalDistance <= 0 || totalDuration <= 0) {
    if (format == "string") {
      return "0 km/h"; // Retourner une valeur par défaut si la distance ou la durée est nulle
    } else if (format == "int") {
      return 0; // Retourner une valeur par défaut si la distance ou la durée est nulle
    }
  }

  if (sport === "Running") {
    // Calculer l'allure en min/km pour la course à pied

    const pacePerKm = totalDuration / totalDistance; // Temps en secondes par km
    const minutesPerKm = Math.floor(pacePerKm / 60); // Minutes par km
    const secondsPerKm = pacePerKm % 60; // Secondes par km
    const restminutePerKm = secondsPerKm / 100;
    const totalMinutesPerKm = minutesPerKm + restminutePerKm; // Convertir les secondes en fraction de minute

    if (format == "string") {
      return `${totalMinutesPerKm.toFixed(2)} min/km`;
    } else if (format == "int") {
      return totalMinutesPerKm.toFixed(2); // Retourner une valeur par défaut si la distance ou la durée est nulle
    }
  } else {
    // Calculer la vitesse en km/h pour les autres activités
    const speedKmH = totalDistance / (totalDuration / 3600);

    if (format == "string") {
      return `${speedKmH.toFixed(2)} km/h`;
    } else if (format == "int") {
      return speedKmH; // Retourner une valeur par défaut si la distance ou la durée est nulle
    }
  }
}

function formatDateISOtoFR(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0"); // Jour sur 2 chiffres
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mois sur 2 chiffres (0-11 → +1)
  const year = date.getFullYear(); // Année sur 4 chiffres
  return `${day}/${month}/${year}`;
}
/*
function getWeekNumber(dateString) {
  const date = new Date(dateString);
  // Clone la date pour éviter de modifier l'original
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  // Calcul du premier jeudi de l'année (pour la norme ISO)
  const pastThursday =
    firstDayOfYear.getDay() <= 4
      ? firstDayOfYear
      : new Date(date.getFullYear(), 0, 1 + (7 - firstDayOfYear.getDay() + 4));

  // Calcul du numéro de semaine
  const weekNumber = Math.ceil(((date - pastThursday) / 86400000 + 1) / 7);
  return weekNumber;
}*/

function getWeekNumber(dateInput) {
  // Si dateInput est déjà un objet Date, on le clone pour éviter toute modification
  const date =
    dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);

  // Vérifie si la date est valide
  if (isNaN(date.getTime())) {
    return NaN; // ou une erreur, selon ce que tu préfères
  }

  // Trouver le premier jeudi de l'année (norme ISO)
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = firstDayOfYear.getDay();
  const firstThursday = new Date(
    date.getFullYear(),
    0,
    1 + (dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek)
  );

  // Calculer le numéro de semaine
  const weekNumber = 1 + Math.round((date - firstThursday) / 86400000 / 7);
  return weekNumber;
}
