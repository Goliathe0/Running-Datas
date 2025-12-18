async function populateHeader(selectedFile) {
  const header = document.querySelector("header");
  const myH1 = document.createElement("h1");
  if (!myH1) return;
  try {
    const response = await fetch(
      `/SportsData/Front-end/src/data/activities_json/${selectedFile}`
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data_json = await response.json();
    console.log("data_json", data_json);
    const emoji = addEmoji(data_json.sport);
    const date = formatDateISOtoFR(data_json.laps[0].start_time);
    // Préparation des données
    // Calcul du dénivelé
    let points = [];
    for (let i = 0; i < data_json.laps.length; i++) {
      points = points.concat(data_json.laps[i].points);
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
    for (let i = 0; i < data_json.laps.length; i++) {
      total_distance += data_json.laps[i].distance / 1000;
    }

    let all_total_time = 0;
    for (let i = 0; i < data_json.laps.length; i++) {
      all_total_time += data_json.laps[i].total_time;
    }

    let total_avg_hr = 0;
    let total_max_hr = 0;
    for (let i = 0; i < data_json.laps.length; i++) {
      total_avg_hr +=
        data_json.laps[i].avg_hr *
        (data_json.laps[i].total_time / all_total_time);
      if (data_json.laps[i].max_hr > total_max_hr) {
        total_max_hr = data_json.laps[i].max_hr;
      }
    }

    let titre =
      "Activité " +
      emoji +
      " " +
      date +
      " \u{00B7} " +
      total_distance.toFixed(2) +
      " km" +
      " \u{2022} " +
      formatTime(all_total_time) +
      " \u{2022} " +
      denivele_pos.toFixed(2) +
      " m D+";
    //html entity middle dot  · Middle Dot U+00B7 &#183; &middot; C2 B7; CSS CODE\00B7
    //• Bullet U+2022 -> \u{00B7} &#8226; &bull; E2 80 A2
    myH1.textContent = titre;
    header.appendChild(myH1);
  } catch (error) {
    console.error("Erreur dans fillAltitudeChart :", error);
  }
}

async function populateSection(obj) {
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
/*
// Fonction pour le graphique d'altitude
async function fillBarChart(activities) {
  const ctx = document.getElementById("monBarChart");
  if (!ctx) return;

  try {
    const statsByPeriod = {};
    console.log("window.selectedPeriod =", window.selectedPeriod);

    let year = 0;
    activities.forEach((a) => {
      // changer, Si all time alors on prend year , si 1 semaine, day etc et on renmplace statByPeriod[period]
      year = new Date(a.date).getUTCFullYear();

      // Normalisation du sport
      let sport = (a.sport || "other").toLowerCase();
      if (!["running", "biking", "other"].includes(sport)) sport = "other";

      if (!statsByPeriod[year]) {
        statsByPeriod[year] = {
          running: { count: 0, dist: 0, deniveleP: 0, temps: 0 },
          biking: { count: 0, dist: 0, deniveleP: 0, temps: 0 },
          other: { count: 0, dist: 0, deniveleP: 0, temps: 0 },
        };
      }

      statsByPeriod[year][sport].count += 1;
      statsByPeriod[year][sport].dist += a.distance || 0;
      statsByPeriod[year][sport].deniveleP += a.deniveleP || 0;
      statsByPeriod[year][sport].temps += a.temps || 0;
    });

    const periods = Object.keys(statsByPeriod);
    const sports = ["running", "biking", "other"];
    const metric = "dist";

    const datasets = sports.map((sport) => ({
      label: sport,
      data: periods.map((year) => statsByPeriod[year][sport][metric]),
      stack: "stack1",
      backgroundColor:
        {
          running: "rgba(255, 99, 132, 0.6)",
          biking: "rgba(54, 162, 235, 0.6)",
          swimming: "rgba(75, 192, 192, 0.6)",
        }[sport] || "rgba(150,150,150,0.6)",
    }));
    console.log("bar chart: datasets", datasets);

    if (window.barChart) window.barChart.destroy(); // éviter les doublons

    window.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: periods,
        datasets: datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: { stacked: true },
          y: { stacked: true, title: { display: true, text: "Distance (km)" } },
        },
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: "Distance par sport et par année",
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur dans fillBarChart :", error);
  }
}*/

// ----------------------------------------------------------------------------
//  Emoji en fonction du sport
//  A FAIRE : ajouter une variable sexe et couleur de peau pour adapter l'emoji
//  infos : let message = "Bonjour \u{1F60A}";
//          console.log(message);
//  <p id="demo"></p>
//  ⚠️ Avec les emojis au-dessus de U+FFFF, il faut utiliser la syntaxe \u{...} (ES6+).
//
//  3️⃣ Utiliser les entités HTML (si c’est pour une page web)
//  <script>
//  document.getElementById("demo").innerHTML = "Bonjour &#128522;"; // 😊
//  </script>
//  💡 &#128522; est le code décimal de l’emoji.
//
//  4️⃣ Exemple combiné avec insertion dynamique
//  document.getElementById("msg").textContent = `Ceci est chaud ${emoji}`;
// ----------------------------------------------------------------------------
function addEmoji(sport) {
  //console.log("sport", sport);
  let emoji = "";
  if (sport === "Running") {
    emoji = "🏃"; // bleu
  } else if (sport === "Biking") {
    emoji = "🚴"; // rose
  } else if (sport === "Hiking") {
    emoji = "🚶⛰️";
  } else {
    emoji = "🚶";
  }
  return emoji;
}

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
