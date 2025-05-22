document.addEventListener("DOMContentLoaded", function () {
  // Remplir le tableau des activités
  fetch("activities_json/index.json")
    .then((res) => res.json())
    .then((fileList) =>
      Promise.all(
        fileList.map((f) => fetch(`activities_json/${f}`).then((r) => r.json()))
      )
    )
    .then((activities) => {
      const tableBody = document.querySelector("#activity-table tbody");

      activities.forEach((activity) => {
        // Extraire les informations nécessaires
        const type = activity.sport || "N/A";
        const date = new Date(activity.laps[0].start_time).toLocaleDateString();
        const totaldistance = activity.laps
          .reduce((sum, lap) => {
            return sum + (lap.distance / 1000 || 0);
          }, 0)
          .toFixed(2);

        const sum_avgBPM = activity.laps.reduce((sum, lap) => {
          return sum + (lap.avg_hr * lap.total_time || 0);
        }, 0);

        const sum_total_time = activity.laps.reduce((sum, lap) => {
          return sum + (lap.total_time || 0);
        }, 0);

        const avgBPM =
          sum_total_time !== 0 ? (sum_avgBPM / sum_total_time).toFixed(0) : 0;

        const duration = formatDuration(sum_total_time);

        const elevationGain = activity.laps
          .reduce((sum, lap) => {
            let gain = 0;
            for (let i = 1; i < lap.points.length; i++) {
              const altitudeDiff =
                (lap.points[i].altitude || 0) -
                (lap.points[i - 1].altitude || 0);
              if (altitudeDiff > 0) {
                gain += altitudeDiff;
              }
            }
            return sum + gain;
          }, 0)
          .toFixed(0);

        const maxBPM = activity.laps.reduce((max, lap) => {
          return Math.max(max, lap.max_hr || 0);
        }, 0);

        // Calculer la vitesse ou l'allure en fonction du type d'activité
        const avgvitesse_Allure =
          totaldistance > 0 && sum_total_time > 0
            ? activity.sport === "Running"
              ? sum_total_time / 60 / totaldistance // Allure en min/km pour la course à pied
              : (totaldistance / (sum_total_time / 3600)).toFixed(2) // Vitesse en km/h pour les autres activités
            : 0;

        // Formater l'allure en min/km
        const Vitesse_Allure =
          activity.sport === "Running"
            ? `${avgvitesse_Allure.toFixed(2)} min/km`
            : `${avgvitesse_Allure} km/h`;

        // Créer une nouvelle ligne dans le tableau
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${type}</td>
          <td>${date}</td>
          <td>${totaldistance}</td>
          <td>${elevationGain}</td>
          <td>${duration}</td>
          <td>${avgBPM} / ${maxBPM}</td>
          <td>${Vitesse_Allure}</td>
        `;

        tableBody.appendChild(row);
      });

      // Mettre à jour les statistiques
      updateStatistics(activities);
    });

  // Écouter les changements dans les boutons déroulants
  document
    .getElementById("activity-type")
    .addEventListener("change", function () {
      // Filtrer les statistiques en fonction du type sélectionné
      const selectedType = this.value;
      filterStatistics(selectedType, document.getElementById("period").value);
    });

  document.getElementById("period").addEventListener("change", function () {
    // Filtrer les statistiques en fonction de la période sélectionnée
    const selectedPeriod = this.value;
    filterStatistics(
      document.getElementById("activity-type").value,
      selectedPeriod
    );
  });
});

// Fonction pour formater la durée en hh:mm:ss
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
