//simplifier fillCells et FillTable

async function fillCells(file, fileName, tableBody) {
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

async function fillTable(index_file_path, tableSelector = "table tbody") {
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
      await fillCells(file, item.filename, tableBody);
    }

    //sinon : une seule activité
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}
