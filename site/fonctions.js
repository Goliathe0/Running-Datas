// Fonction pour calculer la distance totale   VALIDE
function calculateTotalDistance(activity) {
  return activity.laps
    .reduce((sum, lap) => sum + (lap.distance / 1000 || 0), 0)
    .toFixed(2);
}

// Fonction pour calculer le dénivelé total  VALIDE
function calculateTotalElevation(activity) {
  return activity.laps
    .reduce((sum, lap) => {
      let gain = 0;
      for (let i = 1; i < lap.points.length; i++) {
        const altitudeDiff =
          (lap.points[i].altitude || 0) - (lap.points[i - 1].altitude || 0);
        if (altitudeDiff > 0) {
          gain += altitudeDiff;
        }
      }
      return sum + gain;
    }, 0)
    .toFixed(0);
}

// Fonction pour calculer la durée totale VALIDE
function calculateTotalDuration(activity) {
  return activity.laps.reduce((sum, lap) => sum + (lap.total_time || 0), 0);
}

// Fonction pour formater la durée en hh:mm:ss VALIDE
function formatDuration(totalSeconds) {
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
function calculateSpeedOrPace(type, totalDistance, totalDuration) {
  if (totalDistance <= 0 || totalDuration <= 0) {
    return "0 km/h"; // Retourner une valeur par défaut si la distance ou la durée est nulle
  }

  if (type === "Running") {
    // Calculer l'allure en min/km pour la course à pied
    const pacePerKm = totalDuration / totalDistance; // Temps en secondes par km
    const minutesPerKm = Math.floor(pacePerKm / 60); // Minutes par km
    const secondsPerKm = pacePerKm % 60; // Secondes par km
    const restminutePerKm = (secondsPerKm * 0.6) / 100;
    const totalMinutesPerKm = minutesPerKm + restminutePerKm; // Convertir les secondes en fraction de minute
    return `${totalMinutesPerKm.toFixed(2)} min/km`;
  } else {
    // Calculer la vitesse en km/h pour les autres activités
    const speedKmH = (totalDistance / (totalDuration / 3600)).toFixed(2);
    return `${speedKmH} km/h`;
  }
}

// Fonction pour mettre à jour les statistiques
function updateStatistics(activities) {
  const activityCount = activities.length;
  const totalDistance = activities
    .reduce((sum, activity) => {
      return (
        sum +
        activity.laps.reduce((lapSum, lap) => lapSum + (lap.distance || 0), 0) /
          1000
      );
    }, 0)
    .toFixed(2);
  const totalElevation = activities
    .reduce((sum, activity) => {
      return (
        sum +
        activity.laps.reduce((lapSum, lap) => {
          let gain = 0;
          for (let i = 1; i < lap.points.length; i++) {
            const altitudeDiff =
              (lap.points[i].altitude || 0) - (lap.points[i - 1].altitude || 0);
            if (altitudeDiff > 0) {
              gain += altitudeDiff;
            }
          }
          return lapSum + gain;
        }, 0)
      );
    }, 0)
    .toFixed(0);
  const totalTime = formatDuration(
    activities.reduce((sum, activity) => {
      return (
        sum +
        activity.laps.reduce((lapSum, lap) => lapSum + (lap.total_time || 0), 0)
      );
    }, 0)
  );

  document.getElementById("activity-count").textContent = activityCount;
  document.getElementById("total-distance").textContent = totalDistance;
  document.getElementById("total-elevation").textContent = totalElevation;
  document.getElementById("total-time").textContent = totalTime;
}

// Fonction pour filtrer les statistiques
function filterStatistics(type, period) {
  fetch("activities_json/index.json")
    .then((res) => res.json())
    .then((fileList) =>
      Promise.all(
        fileList.map((f) => fetch(`activities_json/${f}`).then((r) => r.json()))
      )
    )
    .then((activities) => {
      let filteredActivities = activities;

      if (type !== "all") {
        filteredActivities = filteredActivities.filter(
          (activity) => activity.sport === type
        );
      }

      if (period !== "all") {
        filteredActivities = filteredActivities.filter((activity) => {
          const activityYear = new Date(activity.laps[0].start_time)
            .getFullYear()
            .toString();
          return activityYear === period;
        });
      }

      // Mettre à jour les statistiques
      updateStatistics(filteredActivities);
    });
}

// Fonction pour mettre à jour les records
function updateRecords(activities) {
  const runningDistances = [
    "100m",
    "200m",
    "400m",
    "1km",
    "2km",
    "5km",
    "10km",
    "15km",
    "semi-marathon",
    "30km",
    "marathon",
    "50km",
    "75km",
    "100km",
    "150km",
    "200km",
    "sortie la plus longue",
    "plus grande ascension",
    "dénivelé positif",
  ];
  const cyclingDistances = [
    "1km",
    "2km",
    "5km",
    "10km",
    "20km",
    "30km",
    "40km",
    "50km",
    "80km",
    "100km",
    "125km",
    "150km",
    "200km",
    "sortie la plus longue",
    "plus grande ascension",
    "dénivelé positif",
  ];
  const swimmingDistances = [
    "25m",
    "50m",
    "100m",
    "200m",
    "300m",
    "400m",
    "500m",
    "1000m",
    "2000m",
    "3000m",
    "5000m",
    "7500m",
    "10000m",
    "plus longue distance",
  ];

  const runningRecords = {};
  const cyclingRecords = {};
  const swimmingRecords = {};

  // Initialiser les records avec des valeurs nulles
  runningDistances.forEach((distance) => (runningRecords[distance] = null));
  cyclingDistances.forEach((distance) => (cyclingRecords[distance] = null));
  swimmingDistances.forEach((distance) => (swimmingRecords[distance] = null));

  activities.forEach((activity) => {
    const type = activity.sport;
    const distance = calculateTotalDistance(activity);
    const duration = calculateTotalDuration(activity);
    const elevationGain = calculateTotalElevation(activity);

    if (type === "Running") {
      // Mettre à jour les records pour la course à pied
      if (distance > (runningRecords["sortie la plus longue"]?.distance || 0)) {
        runningRecords["sortie la plus longue"] = { distance, duration };
      }
      if (
        elevationGain >
        (runningRecords["plus grande ascension"]?.elevationGain || 0)
      ) {
        runningRecords["plus grande ascension"] = { elevationGain, duration };
      }
      if (
        elevationGain > (runningRecords["dénivelé positif"]?.elevationGain || 0)
      ) {
        runningRecords["dénivelé positif"] = { elevationGain, duration };
      }
      // Ajoutez d'autres distances ici
    } else if (type === "Cycling") {
      // Mettre à jour les records pour le cyclisme
      if (distance > (cyclingRecords["sortie la plus longue"]?.distance || 0)) {
        cyclingRecords["sortie la plus longue"] = { distance, duration };
      }
      if (
        elevationGain >
        (cyclingRecords["plus grande ascension"]?.elevationGain || 0)
      ) {
        cyclingRecords["plus grande ascension"] = { elevationGain, duration };
      }
      if (
        elevationGain > (cyclingRecords["dénivelé positif"]?.elevationGain || 0)
      ) {
        cyclingRecords["dénivelé positif"] = { elevationGain, duration };
      }
      // Ajoutez d'autres distances ici
    } else if (type === "Swimming") {
      // Mettre à jour les records pour la natation
      if (distance > (swimmingRecords["plus longue distance"]?.distance || 0)) {
        swimmingRecords["plus longue distance"] = { distance, duration };
      }
      // Ajoutez d'autres distances ici
    }
  });

  // Mettre à jour les tableaux des records
  updateRecordsTable("running-records-table", runningRecords, runningDistances);
  updateRecordsTable("cycling-records-table", cyclingRecords, cyclingDistances);
  updateRecordsTable(
    "swimming-records-table",
    swimmingRecords,
    swimmingDistances
  );
}

// Fonction pour mettre à jour les tableaux des records
function updateRecordsTable(tableId, records, distances) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = "";

  distances.forEach((distance) => {
    const record = records[distance];
    if (record) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${distance}</td>
        <td>${formatDuration(record.duration)}</td>
      `;
      tableBody.appendChild(row);
    }
  });
}

// Fonction pour ouvrir les onglets
function openTab(event, tabName) {
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("active");
  }

  const tabButtons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove("active");
  }

  document.getElementById(tabName).classList.add("active");
  event.currentTarget.classList.add("active");
}
