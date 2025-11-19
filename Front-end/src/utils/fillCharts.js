//main menu
async function populateStats(data) {
  console.log("data dans populateStats", data);
  //change en fonction de si c'est une seule activité ou un tas d'activités
  //populateHeader();
  //populateSection(data);

  if (document.getElementById("monFromage")) {
    console.log("appele de fillPieChart");
    fillPieChart(data);
  }

  if (document.getElementById("monBarChart")) {
    console.log("appele de fillBarChart");
    fillBarChart(data);
  }

  if (document.getElementById("monNuage")) {
    console.log("appele de updateScatterChart");
    updateScatterChart(data); // on appelle la version "update"
  }
  // await fillAltitudeChart(selectedFile);
  // await fillSpeedHrChart(selectedFile);
  //Activity.html
  if (document.getElementById("monAltitude")) {
    console.log("appele de fillAltitudeChart");
    fillAltitudeChart(data); // on appelle la version "update"
  }

  //Activity.html
  if (document.getElementById("maVitesse")) {
    console.log("appele de fillSpeedHrChart");
    fillSpeedHrChart(data); // on appelle la version "update"
  }
}

// Fonction pour le graphique d'altitude
async function fillBarChart(activities) {
  const ctx = document.getElementById("monBarChart");
  if (!ctx) return;

  try {
    console.log("window.selectedPeriod =", window.selectedPeriod);

    const periodType = window.selectedPeriod || "all";
    const statsByPeriod = {};

    const sports = ["running", "biking", "other"];
    const metric = "dist";

    // ---------------------------
    // 1. Génération des périodes
    // ---------------------------

    const now = new Date();
    let periods = [];

    // ALL → années
    if (periodType === "all") {
      activities.forEach((a) => {
        const year = new Date(a.date).getUTCFullYear();
        if (!periods.includes(year)) periods.push(year);
      });
      periods.sort();

      // YEAR → 12 derniers mois
    } else if (periodType === "year") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push(`${d.getFullYear()}-${d.getMonth() + 1}`);
      }

      // 6 MONTHS → 6 derniers mois
    } else if (periodType === "6months") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push(`${d.getFullYear()}-${d.getMonth() + 1}`);
      }

      // 1 MONTH → 4 dernières semaines
    } else if (periodType === "1month") {
      const currentWeek = getWeekFromDate(now);
      for (let i = 3; i >= 0; i--) {
        periods.push(`W${currentWeek - i}`);
      }

      // 1 WEEK → les 7 jours
    } else if (periodType === "1week") {
      periods = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
    }

    // -----------------------------------------
    // 2. INITIALISATION statsByPeriod
    // -----------------------------------------

    periods.forEach((p) => {
      statsByPeriod[p] = {
        running: { count: 0, dist: 0, deniveleP: 0, temps: 0 },
        biking: { count: 0, dist: 0, deniveleP: 0, temps: 0 },
        other: { count: 0, dist: 0, deniveleP: 0, temps: 0 },
      };
    });

    // -----------------------------------------
    // 3. REMPLISSAGE selon selectedPeriod
    // -----------------------------------------

    activities.forEach((a) => {
      let sport = (a.sport || "other").toLowerCase();
      if (!sports.includes(sport)) sport = "other";

      const d = new Date(a.date);

      let key = null;

      // ALL → année
      if (periodType === "all") {
        key = d.getUTCFullYear();

        // YEAR / 6MONTHS → clé AAAA-M
      } else if (periodType === "year" || periodType === "6months") {
        const k = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (statsByPeriod[k]) key = k;

        // 1 MONTH → semaine Wxx
      } else if (periodType === "1month") {
        const w = getWeekFromDate(d);
        const k = `W${w}`;
        if (statsByPeriod[k]) key = k;

        // 1 WEEK → jour de semaine
      } else if (periodType === "1week") {
        const day = (d.getDay() + 6) % 7; // 0=lun..6=dim
        key = periods[day];
      }

      if (!key || !statsByPeriod[key]) return;

      statsByPeriod[key][sport].count++;
      statsByPeriod[key][sport].dist += a.distance || 0;
      statsByPeriod[key][sport].deniveleP += a.deniveleP || 0;
      statsByPeriod[key][sport].temps += a.temps || 0;
    });

    // -----------------------------------------
    // 4. Création du bar chart
    // -----------------------------------------

    const datasets = sports.map((sport) => ({
      label: sport,
      data: periods.map((p) => statsByPeriod[p][sport][metric]),
      stack: "stack1",
      backgroundColor: {
        running: "rgba(255, 99, 132, 0.6)",
        biking: "rgba(54, 162, 235, 0.6)",
        other: "rgba(150,150,150,0.6)",
      }[sport],
    }));

    if (window.barChart) window.barChart.destroy();

    window.barChart = new Chart(ctx, {
      type: "bar",
      data: { labels: periods, datasets },
      options: {
        responsive: true,
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            title: { display: true, text: "Distance (km)" },
          },
        },
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: `Distance par sport — période : ${periodType}`,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur dans fillBarChart :", error);
  }
}

// Fonction pour le graphique d'altitude
async function fillPieChart(activities) {
  const ctx = document.getElementById("monFromage");
  if (!ctx) return;

  try {
    const statsBySport = {};

    activities.forEach((a) => {
      if (!statsBySport[a.sport]) {
        statsBySport[a.sport] = { count: 0, dist: 0 };
      }
      statsBySport[a.sport].count += 1;
      statsBySport[a.sport].dist += a.distance || 0;
    });

    const labels = Object.keys(statsBySport);
    const data_sports = labels.map((s) => statsBySport[s].count);
    console.log(
      "pie chart : statsBySport, labels et data_sports",
      statsBySport,
      labels,
      data_sports
    );
    const colors = [
      "rgba(54, 162, 235, 0.7)", // bleu
      "rgba(255, 99, 132, 0.7)", // rouge
      "rgba(75, 192, 192, 0.7)", // vert d’eau
      "rgba(255, 206, 86, 0.7)", // jaune
      "rgba(153, 102, 255, 0.7)", // violet
      "rgba(255, 159, 64, 0.7)", // orange
    ];

    if (window.pieChart) window.pieChart.destroy(); // éviter les doublons

    window.pieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Nombre d'activités",
            data: data_sports,
            borderColor: "grey",
            borderWidth: 0,
            borderdash: 100, //?
            offset: 0,
            spacing: 0,
            weight: 1, // ?
            backgroundColor: colors.slice(0, labels.length),
            borderAlign: "inner", //??

            //tester les options
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const sport = context.label;
                const { count, dist } = statsBySport[sport];
                return `${sport}: ${count} activités (${dist.toFixed(1)} km)`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur dans fillPieChart :", error);
  }
}

async function fillAltitudeChart(selectedFile) {
  const ctx = document.getElementById("monAltitude");
  if (!ctx) return; // Si le canvas n'existe pas, on sort

  try {
    const response = await fetch(
      `/SportsData/Front-end/src/data/activities_json/${selectedFile}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data_json = await response.json();

    // Préparation des données pour l'altitude
    let dataPoints = [];
    for (let i = 0; i < data_json.laps.length; i++) {
      const lapPoints = data_json.laps[i].points;
      for (let j = 0; j < lapPoints.length; j++) {
        dataPoints.push({
          x: lapPoints[j].distance,
          y: lapPoints[j].altitude,
        });
      }
    }

    // Calcul de la distance maximale
    const maxDistance = Math.max(...dataPoints.map((point) => point.x));
    const roundedMaxDistance = Math.ceil(maxDistance / 1000) * 1000;

    // Plugin pour le remplissage personnalisé
    const customFillPlugin = {
      id: "customFillBySlope",
      afterDatasetsDraw(chart) {
        const {
          ctx,
          chartArea: { top, bottom },
          scales: { x, y },
        } = chart;
        ctx.save();
        for (let i = 0; i < dataPoints.length - 1; i++) {
          const x0 = x.getPixelForValue(dataPoints[i].x);
          const y0 = y.getPixelForValue(dataPoints[i].y);
          const x1 = x.getPixelForValue(dataPoints[i + 1].x);
          const y1 = y.getPixelForValue(dataPoints[i + 1].y);
          const deltaAlt = dataPoints[i + 1].y - dataPoints[i].y;
          const deltaDist = dataPoints[i + 1].x - dataPoints[i].x;
          const slope = deltaDist !== 0 ? (deltaAlt / deltaDist) * 100 : 0;
          let fillColor =
            slope > 6
              ? "rgba(255, 0, 0, 0.3)"
              : slope > 2
              ? "rgba(255, 165, 0, 0.3)"
              : slope >= -4
              ? "rgba(0, 255, 0, 0.3)"
              : "rgba(0, 0, 255, 0.3)";
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x1, bottom);
          ctx.lineTo(x0, bottom);
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.restore();
      },
    };

    // Création du graphique d'altitude
    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Altitude (m)",
            data: dataPoints,
            borderColor: "blue",
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: "Altitude (m)" },
          },
          x: {
            type: "linear",
            min: 0,
            max: roundedMaxDistance,
            ticks: {
              stepSize: 1000,
              callback: (value) => (value % 1000 === 0 ? value : null),
            },
            title: { display: true, text: "Distance (m)" },
          },
        },
      },
      plugins: [customFillPlugin],
    });
  } catch (error) {
    console.error("Erreur dans fillAltitudeChart :", error);
  }
}

// Fonction pour le graphique de vitesse/fréquence cardiaque
async function fillSpeedHrChart(selectedFile) {
  const ctx = document.getElementById("maVitesse");
  if (!ctx) return;

  try {
    const response = await fetch(
      `/SportsData/Front-end/src/data/activities_json/${selectedFile}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data_json = await response.json();

    // Préparation des données
    let x_distance = [];
    let y_hr = [];
    let y_speed = [];
    let y_altitude = [];
    for (let i = 0; i < data_json.laps.length; i++) {
      const lapPoints = data_json.laps[i].points;
      for (let j = 0; j < lapPoints.length; j++) {
        x_distance.push(lapPoints[j].distance);
        y_hr.push(lapPoints[j].heartRate);
        y_speed.push(lapPoints[j].speed);
        y_altitude.push(lapPoints[j].altitude);
      }
    }

    // Détruit le graphique existant s'il y en a un
    if (window.vitesseChart) {
      window.vitesseChart.destroy();
    }

    // Création du graphique vitesse/fréquence cardiaque
    window.vitesseChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Fréquence cardiaque (bpm)",
            data: x_distance.map((x, i) => ({ x, y: y_hr[i] })),
            segment: {
              borderJoinStyle: "round", // rend les angles plus doux
            },
            borderColor: "rgba(238, 20, 93, 1)",
            backgroundColor: "rgba(238, 20, 93, 1)",
            borderWidth: 2,
            tension: 0.8,
            cubicInterpolationMode: "default", //"monotone",
            pointRadius: 0,
            fill: false,
            stepped: false,
          },
          {
            label: "Vitesse (m/s)",
            data: x_distance.map((x, i) => ({ x, y: y_speed[i] })),
            borderWidth: 2,
            borderColor: "rgba(116, 131, 214, 1)",
            backgroundColor: "rgba(116, 131, 214, 0.65)",
            tension: 0.4,
            cubicInterpolationMode: "monotone",
            pointRadius: 0,
            stepped: false,
            yAxisID: "y1",
          },
          {
            label: "Altitude (m)",
            data: x_distance.map((x, i) => ({ x, y: y_altitude[i] })),
            borderColor: "rgba(155, 150, 150, 0.65)",
            backgroundColor: "rgba(155, 150, 150, 0.3)",
            borderWidth: 1,
            tension: 0.2,
            pointRadius: 0,
            yAxisID: "y2",
            fill: {
              target: "origin",
            },
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: { display: true, text: "Fréquence cardiaque (bpm)" },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: { display: true, text: "Vitesse (m/s)" },
            grid: { drawOnChartArea: false },
          },
          x: {
            type: "linear",
            display: true,
            title: { display: true, text: "Distance (m)" },
            ticks: {
              stepSize: 1000,
              callback: (value) => (value % 1000 === 0 ? value : null),
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur dans fillSpeedHrChart :", error);
  }
}
const index_file = `/SportsData/Front-end/src/data/activities_json/index.json`;
async function fillScatterChart(index_file) {
  try {
    const response = await fetch(index_file);
    //"/SportsData/Front-end/src/data/activities_json/index.json"

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json_files = await response.json();
    console.log("json_file", json_files);

    data_scatter = [];

    for (let i = 0; i < json_files.length; i++) {
      const file = `/SportsData/Front-end/src/data/activities_json/${json_files[i]["filename"]}`;
      const dataPoint = await ReadData(file);
      if (dataPoint) {
        dataPoint.sport = json_files[i].sport; // Ajoute le type de sport aux données
        data_scatter.push(dataPoint);
      }
    }
    console.log("data_scatter", data_scatter);

    // Affiche toutes les données au départ
    updateScatterChart(data_scatter);
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}

// -------------------
// MAJ du graphique
// -------------------
function updateScatterChart(data_Scatter) {
  const ctx = document.getElementById("monNuage");
  if (!ctx) return;

  if (scatterChart) scatterChart.destroy();
  console.log("data_scatter du nuage", data_Scatter);

  scatterChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: selectedSport,
          data: data_Scatter, // chaque point doit contenir {x, y, sport, date, distance, vitesse}
          borderColor: "blue",
          backgroundColor: "rgba(0, 0, 255, 0.5)",
        },
      ],
    },
    options: {
      scales: {
        y: { title: { display: true, text: "Vitesse (m/s)" } },
        x: { title: { display: true, text: "Distance (km)" } },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const point = context.raw; // données du point
              return `${point.sport} - ${formatDateISOtoFR(
                point.date
              )} - ${point.x.toFixed(2)}km - ${point.y.toFixed(2)}km/h`;
            },
          },
        },
        legend: {
          display: false, // optionnel : on masque la légende si inutile
        },
      },
    },
  });
}
