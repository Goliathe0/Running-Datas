//---------------------
//Activities
//---------------------
async function fillActivitiesTable(
  index_file_path,
  tableSelector = "table tbody"
) {
  console.log("index_file_path", index_file_path);
  try {
    const response = await fetch(index_file_path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json_files = await response.json();
    const tableBody = document.querySelector(tableSelector);

    //si liste d'activité / mieux si ce type de tableau alors :
    for (const item of json_files) {
      const file = `/SportsData/Front-end/src/data/activities_json/${item.filename}`;
      await fillActivitiesCells(file, item.filename, tableBody);
    }

    //sinon : une seule activité
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}

async function fillActivitiesCells(file, fileName, tableBody) {
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
    const row = tableBody.insertRow();
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

//---------------------
//Activity
//---------------------

async function fillActivityTable(activity_file, lapsMode) {
  //console.log("fillActivityTable éxécutée");
  //console.log("activity_file in fillActivityTable :", activity_file);
  const computed = await calculateActivityData(activity_file, lapsMode);
  console.log("computed : ", computed);
  console.log("computed laps : ", computed.laps);
  console.log("computed records : ", computed.records);
  fillLapsTable(computed, computed.sport, lapsMode, "#laps-table tbody");
  fillRecordsTable(computed.records, "#records-table tbody");
}
//---------------------
//Calcul
//---------------------

async function calculateActivityData(activity_file, lapsMode) {
  console.log("calculateActivityData éxécutée");
  const response = await fetch(
    `/SportsData/Front-end/src/data/activities_json/${activity_file}`
  );
  if (!response.ok) throw new Error("Erreur chargement JSON");

  const data = await response.json();

  // Regroupe déjà tous les points en un tableau
  const all_points = mergeAllPoints(data);

  // Calcul des laps selon le mode

  let lapsManual = computeManualLaps(data.laps, data.sport);

  let lapsAuto = computeAutoLaps(all_points, data.sport);

  const sport = data.sport;
  // Calcul des records
  const records = computeRecords(all_points, data.sport);
  //console.log("records: ", records);
  return { sport, lapsManual, lapsAuto, records };
}

function computeManualLaps(lapsData, sport) {
  console.log("computeManualLaps éxécutée");
  let result = [];

  for (const lap of lapsData) {
    let denivele_pos = 0;
    let denivele_neg = 0;

    for (let i = 1; i < lap.points.length; i++) {
      const delta = lap.points[i].altitude - lap.points[i - 1].altitude;
      if (delta > 0) denivele_pos += delta;
      else denivele_neg -= delta;
    }

    result.push({
      distance: lap.distance,
      time: lap.total_time,
      speed: calculateSpeedOrPace(
        sport,
        lap.distance,
        lap.total_time * 1000,
        "int"
      ),
      avg_hr: lap.avg_hr,
      max_hr: lap.max_hr,
      dplus: denivele_pos,
      dneg: denivele_neg,
    });
  }

  return result;
}

function computeAutoLaps(points, sport) {
  console.log("computeAutoLaps éxécutée");
  let LapDistance = 1000;
  if (sport === "Biking") {
    LapDistance = 5000;
  }

  let result = [];
  let dplus = 0,
    dneg = 0;
  let hrSum = 0,
    hrCount = 0,
    hrMax = 0;
  let lastLapStartDistance = points[0].distance;
  let lastLapStartTime = new Date(points[0].time).getTime();

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const prev = points[i - 1];

    // Altitude
    const da = (p.altitude ?? 0) - (prev.altitude ?? 0);
    if (da > 0) dplus += da;
    else dneg += Math.abs(da);

    // HR
    if (typeof p.heartRate === "number") {
      hrSum += p.heartRate;
      hrCount++;
      hrMax = Math.max(hrMax, p.heartRate);
    }

    // Lap atteint ?
    if (p.distance - lastLapStartDistance >= LapDistance) {
      const now = new Date(p.time).getTime();
      const lapTime = (now - lastLapStartTime) / 1000;

      result.push({
        distance: LapDistance,
        time: lapTime,
        speed: calculateSpeedOrPace(sport, LapDistance, lapTime * 1000, "int"),
        avg_hr: hrCount ? Math.round(hrSum / hrCount) : null,
        max_hr: hrMax,
        dplus,
        dneg,
      });

      // Reset
      lastLapStartDistance = p.distance;
      lastLapStartTime = now;
      dplus = dneg = 0;
      hrSum = hrCount = hrMax = 0;
    }
  }

  return result;
}

//---------------------
//Remplissage des tableaux
//---------------------

async function fillLapsTable(
  data,
  sport,
  lapsMode,
  tableSelector = "table tbody"
) {
  console.log("fillLapsTable éxécutée");

  const tableBody = document.querySelector(tableSelector);

  // Maj du header
  updateLapsTableHeader(sport);

  // --- Nettoyage : vider le body du tableau avant de remplir (évite doublons)
  if (tableBody) {
    // retrait sécurisé de toutes les lignes existantes
    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }
  }

  // Si laps manuels → on remplit directement et on quitte
  if (lapsMode === "manual") {
    //laps trigger manuel
    console.log("remplit le tableau laps en mode manual");
    fillManualLaps(data.lapsManual, tableBody);
  } else if (lapsMode === "auto") {
    //calcul pour lap auto (1000m)
    fillAutoLaps(data.lapsAuto, tableBody);
  }
  updateLapsTableHeaderColumns(lapsMode);
}

function fillAutoLaps(laps, tableBody) {
  console.log("fillAutoLaps éxécutée");
  if (!laps || !tableBody) return;

  const tbody = tableBody;

  tbody.innerHTML = "";

  for (const lap of laps) {
    const row = tbody.insertRow();
    row.insertCell(0).textContent = lap.distance;
    row.insertCell(1).textContent = formatTime(lap.time);
    row.insertCell(2).textContent = lap.speed;
    row.insertCell(3).textContent = `${lap.avg_hr ?? ""} / ${lap.max_hr ?? ""}`;
    row.insertCell(4).textContent = `${lap.dplus.toFixed(
      0
    )} / ${lap.dneg.toFixed(0)}`;
  }
}

function fillManualLaps(laps, tableBody) {
  console.log("fillManualLaps éxécutée");
  console.log("laps", laps);
  if (!laps || !tableBody) return;

  const tbody = tableBody;

  tbody.innerHTML = "";

  // On parcourt les laps tels qu'ils sont fournis dans data.laps
  for (const lap of laps) {
    const row = tbody.insertRow();
    row.insertCell(0).textContent = lap.distance;
    row.insertCell(1).textContent = formatTime(lap.time);
    row.insertCell(2).textContent = lap.speed;
    row.insertCell(3).textContent = `${lap.avg_hr ?? ""} / ${lap.max_hr ?? ""}`;
    row.insertCell(4).textContent = `${lap.dplus.toFixed(
      0
    )} / ${lap.dneg.toFixed(0)}`;
  }
}

function updateLapsTableHeader(sport) {
  console.log("updateLapsTableHeader éxécutée");
  const th = document.querySelector("#laps-table thead tr th:nth-child(3)");

  if (!th) return;

  if (sport === "Running") {
    th.textContent = "allure (m/s)";
  } else {
    th.textContent = "vitesse (km/h)";
  }
}

function updateLapsTableHeaderColumns(lapsMode) {
  console.log("updateLapsTableHeaderColumns éxécutée");
  const headerRow = document.querySelector("#laps-table thead tr");
  const bodyRows = document.querySelectorAll("#laps-table tbody tr");

  if (!headerRow) return;

  if (lapsMode === "auto") {
    // masque la colonne "temps" (2e colonne) pour l'entête et toutes les lignes
    if (headerRow.cells[1]) headerRow.cells[1].style.display = "none";
    bodyRows.forEach((r) => {
      if (r.cells[1]) r.cells[1].style.display = "none";
    });
  } else {
    // ré-affiche la 2e colonne partout
    if (headerRow.cells[1]) headerRow.cells[1].style.display = "";
    bodyRows.forEach((r) => {
      if (r.cells[1]) r.cells[1].style.display = "";
    });
  }
}

function computeRecords(all_points, sport) {
  console.log("computeRecords éxécutée");
  const Running_distances = [
    200, 400, 1000, 2000, 5000, 10000, 15000, 20000, 21097, 30000, 42195, 50000,
    100000, 150000, 200000,
  ];
  const Biking_distances = [
    1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000, 75000, 100000, 125000,
    150000, 200000,
  ];
  let distances = [];

  if (sport === "Running") {
    distances = Running_distances;
  } else if (sport === "Biking") {
    distances = Biking_distances;
  }

  let records = [];
  let indexDistance = 0;

  const distanceMax = all_points[all_points.length - 1].distance;

  // Initialiser records pour chaque distance cible
  for (i = 0; i < distances.length - 1; i++) {
    if (distances[i] < distanceMax) {
      records.push({
        distance: distances[i],
        time: Infinity,
      });
    }
  }

  for (let i = 0; i < all_points.length - 1; i++) {
    const p1 = all_points[i];
    const t1 = new Date(p1.time).getTime();
    indexDistance = 0;
    //console.log("RESET", i, indexDistance);

    for (let j = i + 1; j < all_points.length; j++) {
      const p2 = all_points[j];

      if (indexDistance >= records.length) break;

      if (p2.distance - p1.distance >= records[indexDistance].distance) {
        const t2 = new Date(p2.time).getTime();
        const dt = (t2 - t1) / 1000;

        if (dt < records[indexDistance].time) {
          records[indexDistance].time = dt;
        }
        if (distances[indexDistance] < distanceMax) {
          indexDistance++;
        } else {
          //break;
          // ici supprimer les lignes en trop
        }
      }
    }
  }
  //console.log("records: ", records);
  return records;
}

function fillRecordsTable(records, tableSelector = "table tbody") {
  console.log("fillRecordsTable éxécutée");
  const tableBody = document.querySelector(tableSelector);
  // Nettoyage du tableau
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }

  console.log("records", records);
  console.log("ditsance / time :", records[0].distance, records[0].time);

  for (i = 0; i < records.length; i++) {
    // Création d'une nouvelle ligne
    const row = tableBody.insertRow();

    // Ajout des cellules
    row.insertCell(0).textContent = records[i].distance; // Distance (ex: 200)
    row.insertCell(1).textContent = formatTime(records[i].time); // Temps (ex: 27)
  }

  //-------------------
  //
  /*const utilisateur = {
      nom: "Jean",
      âge: 30,
      ville: "Paris"
      };

      const entrées = Object.entries(utilisateur);
      console.log(entrées);
      // Résultat : [["nom", "Jean"], ["âge", 30], ["ville", "Paris"]]

      for (const [clé, valeur] of entrées) {
      console.log(`${clé}: ${valeur}`);
      }*/
  //
  //-------------------
}

function mergeAllPoints(data) {
  console.log("mergeAllPoints éxécutée");
  let points = [];
  for (const lap of data.laps) {
    if (lap.points) points = points.concat(lap.points);
  }
  return points;
}
