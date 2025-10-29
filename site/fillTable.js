let data_scatter = [];
let scatterChart = null; // Variable globale pour stocker le graphique

//
async function populate() {
  try {
    const response = await fetch("stats.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("data", data);
    populateHeader();
    populateSection(data);
    fillPieChart(data);
    // Ici, tu peux utiliser data pour remplir ton tableau HTML
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}

function populateHeader() {
  const header = document.querySelector("header");
  const myH1 = document.createElement("h1");
  myH1.textContent = "toutes les activités";
  header.appendChild(myH1);
}

function populateSection(obj) {
  const section = document.querySelector("section");
  const sport = Object.keys(obj);
  for (var i = 0; i < sport.length; i++) {
    const resumeH1 = document.createElement("h2");

    if (sport.length > 0) {
      resumeH1.textContent = sport[i]; // ou data[0].titre, data[0].stat, etc.
    } else {
      resumeH1.textContent = "Aucune donnée disponible";
    }

    section.appendChild(resumeH1);
    const sportalltime = document.createElement("p");
    const sportdataalltime = obj[sport[i]].all_time;
    sportalltime.innerHTML = `
<strong>Nombre de sorties :</strong> ${sportdataalltime.nb}<br>
<strong>Distance parcourue :</strong> ${Math.round(
      sportdataalltime.dist
    )} km<br>
<strong>Durée :</strong> ${formatTime(sportdataalltime.time)}<br>`;
    section.appendChild(sportalltime);
  }
}
populate();

async function fillCells(file, fileName) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Calcul du dénivelé
    let points = [];
    for (let i = 0; i < data.laps.length; i++) {
      points = points.concat(data.laps[i].points);
    }
    let denivele_pos = 0;
    let denivele_neg = 0;

    for (let i = 1; i < points.length; i++) {
      const delta_alt = points[i].altitude - points[i - 1].altitude;
      if (delta_alt > 0) {
        denivele_pos += delta_alt;
      } else {
        denivele_neg -= delta_alt;
      }
    }
    let total_distance = 0;
    for (let i = 0; i < data.laps.length; i++) {
      total_distance += data.laps[i].distance / 1000;
    }

    let all_total_time = 0;
    for (let i = 0; i < data.laps.length; i++) {
      all_total_time += data.laps[i].total_time;
    }

    let total_avg_hr = 0;
    let total_max_hr = 0;
    for (let i = 0; i < data.laps.length; i++) {
      total_avg_hr +=
        data.laps[i].avg_hr * (data.laps[i].total_time / all_total_time);
      if (data.laps[i].max_hr > total_max_hr) {
        total_max_hr = data.laps[i].max_hr;
      }
    }

    // Sélection du tableau
    const table = document.querySelector("table tbody");

    // Ajout d'une nouvelle ligne
    const row = table.insertRow();
    row.setAttribute("data-file", fileName); // Ajoute l'attribut data-file
    // Remplissage des cellules
    row.insertCell(0).textContent = data.sport;
    row.insertCell(1).textContent = formatDateISOtoFR(data.laps[0].start_time);
    row.insertCell(2).textContent = total_distance.toFixed(2);
    row.insertCell(3).textContent = `${Math.floor(
      denivele_pos
    )} (D+) / ${Math.floor(denivele_neg)} (D-)
   `;
    row.insertCell(4).textContent = formatTime(all_total_time);
    row.insertCell(5).textContent = `${Math.floor(
      total_avg_hr
    )} - ${total_max_hr}`;
    row.insertCell(6).textContent = calculateSpeedOrPace(
      data.sport,
      total_distance,
      all_total_time,
      "string"
    );

    row.addEventListener("click", function () {
      const fileName = this.getAttribute("data-file");
      console.log("Fichier cliqué :", fileName);
      localStorage.setItem("selectedActivityFile", fileName);
      //window.location.href = "Activity.html"; // Redirige vers la page des graphiques});
      window.open("Activity.html", "_blank");
    });
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${file} :`, error);
  }
}

async function fillTable() {
  try {
    const response = await fetch("activities_json/index.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json_files = await response.json();
    const table = document.querySelector("table tbody");
    for (let i = 0; i < json_files.length; i++) {
      const filePath = `activities_json/${json_files[i]["filename"]}`;
      await fillCells(filePath, json_files[i]["filename"]);
    }
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}

// Fonction pour le graphique d'altitude
async function fillAltitudeChart(selectedFile) {
  const ctx = document.getElementById("monAltitude");
  if (!ctx) return; // Si le canvas n'existe pas, on sort

  try {
    const response = await fetch(`activities_json/${selectedFile}`);
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
async function fillPieChart(data) {
  const ctx = document.getElementById("monFromage");
  if (!ctx) return;

  try {
    // Préparation des données
    let data_sports = [];
    let labels = [];
    const sport = Object.keys(data);
    for (var i = 0; i < sport.length - 1; i++) {
      if (sport.length > 0) {
        labels.push(sport[i]);
        data_sports.push(data[sport[i]].all_time.nb); // ou data[0].titre, data[0].stat, etc.
        //y: lapPoints[j].altitude,
      } else {
        resumeH1.textContent = "Aucune donnée disponible";
      }
    }
    //const sportdataalltime = obj[sport[i]].all_time;
    //<strong>Nombre de sorties :</strong> ${sportdataalltime.nb}<br>
    //sportdataalltime.dist
    console.log("labels", labels);
    console.log("data_sports", data_sports);
    // Création du graphique vitesse/fréquence cardiaque
    new Chart(ctx, {
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
            backgroundColor: ["blue", "red", "green"],
            borderAlign: "inner", //??

            //tester les options
          },
        ],
      },
    });
  } catch (error) {
    console.error("Erreur dans fillSpeedHrChart :", error);
  }
}

let vitesseChart = null; // Variable globale pour stocker l'instance du graphique

// Fonction pour le graphique de vitesse/fréquence cardiaque
async function fillSpeedHrChart(selectedFile) {
  const ctx = document.getElementById("maVitesse");
  if (!ctx) return;

  try {
    const response = await fetch(`activities_json/${selectedFile}`);
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

function toggleDataset(chartId, datasetIndex) {
  console.log("chartId:", chartId);
  console.log("Tentative de toggle du dataset index :", datasetIndex);
  /*const chart = window[`${chartId}Chart`]; // Récupère l'instance du graphique
  if (!chart) {
    console.log("Aucun graphique trouvé.");
    return;
  }*/
  if (!window.vitesseChart) {
    console.log("Aucun graphique trouvé.");
    return;
  }
  //const dataset = chart.data.datasets[datasetIndex];
  const dataset = window.vitesseChart.data.datasets[datasetIndex];
  if (!dataset) {
    console.log("Aucun dataset trouvé à l'index :", datasetIndex);
    return;
  }

  console.log("Dataset trouvé :", dataset.label);
  // Récupère les métadonnées du dataset

  //const meta = chart.getDatasetMeta(datasetIndex);
  const meta = window.vitesseChart.getDatasetMeta(datasetIndex);
  console.log("Meta avant toggle :", meta.hidden);

  // Inverse la visibilité du dataset
  meta.hidden = !meta.hidden;
  console.log("Meta après toggle :", meta.hidden);
  //meta.hidden = meta.hidden === null ? !dataset.hidden : null;

  // Met à jour le graphique
  //chart.update();
  window.vitesseChart.update();
}

// Fonction pour le graphique de nuage de points
async function ReadData(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Calcul de la distance totale et de la vitesse moyenne
    let total_distance = 0;
    let all_total_time = 0;
    for (let i = 0; i < data.laps.length; i++) {
      total_distance += data.laps[i].distance / 1000;
      all_total_time += data.laps[i].total_time;
    }

    // Calcul de la vitesse moyenne
    const average_speed = calculateSpeedOrPace(
      data.sport,
      total_distance,
      all_total_time,
      "int"
    );

    // Retourne une paire {x: distance, y: vitesse} avec le type de sport
    return {
      x: total_distance,
      y: average_speed,
      sport: data.sport,
    };
  } catch (error) {
    console.error("Erreur dans ReadData :", error);
    return null;
  }
}

async function fillScatterChart() {
  try {
    const response = await fetch("activities_json/index.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json_files = await response.json();
    //console.log("json_file", json_files);

    data_scatter = [];

    for (let i = 0; i < json_files.length; i++) {
      const filePath = `activities_json/${json_files[i]["filename"]}`;
      const dataPoint = await ReadData(filePath);
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

function updateScatterChart(data_Scatter) {
  const ctx = document.getElementById("monNuage");
  // Création du graphique en nuage de points
  if (!ctx) return;
  // Détruit le graphique existant s'il y en a un
  if (scatterChart) {
    scatterChart.destroy();
  }
  scatterChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Vitesse en fonction de la distance",
          data: data_Scatter,
          borderColor: "blue",
          backgroundColor: "rgba(0, 0, 255, 0.5)",
        },
      ],
    },
    options: {
      scales: {
        y: { title: { display: true, text: "Vitesse (m/s)" } },
        x: {
          title: { display: true, text: "Distance (m)" },
        },
      },
    },
  });
}

function filterTable(sport) {
  const rows = document.querySelectorAll("table tbody tr");
  rows.forEach((row) => {
    const sportCell = row.cells[0];
    if (sport === "All" || sportCell.textContent === sport) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  // Filtre les données du graphique
  const filteredData = data_scatter.filter(
    (data) => sport === "All" || data.sport === sport
  );
  console.log("sport : ", sport, "filteredData : ", filteredData);
  updateScatterChart(filteredData);
}
