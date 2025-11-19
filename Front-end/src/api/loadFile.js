// -------------------
// Chargement des activités depuis l'index
// -------------------
async function loadData_indexFile(index_file) {
  const response = await fetch(index_file);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const json_files = await response.json();

  const activities = [];

  for (let i = 0; i < json_files.length; i++) {
    const file = `/SportsData/Front-end/src/data/activities_json/${json_files[i].filename}`;
    const dataPoint = await readActivityData(file);
    if (dataPoint) {
      dataPoint.sport = json_files[i].sport;
      dataPoint.date = json_files[i].date;
      activities.push(dataPoint);
    }
  }

  return activities;
}

// -------------------
// Chargement des activités depuis le fichiers stats.json
// -------------------
/*async function loadStats_File(stats_file) {
  const response = await fetch(stats_file);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const statsActivities = await response.json();
  console.log("statsActivities", statsActivities);

  return statsActivities;
}*/
async function loadStats_indexFile(index_file) {
  const response = await fetch(index_file);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const json_files = await response.json();

  const statsActivities = [];

  for (let i = 0; i < json_files.length; i++) {
    const file = `/SportsData/Front-end/src/data/activities_json/${json_files[i].filename}`;
    const dataPoint = await readActivityData(file);
    if (dataPoint) {
      statsActivities.push(dataPoint);
    }
  }
  //console.log("statsActivities dans loadStats_File", statsActivities);
  return statsActivities;
}
// -------------------
// Lecture d’un fichier d’activité
// -------------------
async function readActivityData(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    //console.log("data brut :", data);

    let total_distance = 0;
    let all_total_time = 0;
    let denivelePTotal = 0;
    let deniveleNTotal = 0;
    let previousAltitude = data.laps[0].points[0].altitude;
    let dateActivite = data.laps[0].start_time;
    let semaineActivite = getWeekNumber(dateActivite);

    for (let lap of data.laps) {
      total_distance += lap.distance / 1000;
      all_total_time += lap.total_time;

      for (let point of lap.points) {
        if (point.altitude - previousAltitude > 0) {
          denivelePTotal += point.altitude - previousAltitude;
        } else if (point.altitude - previousAltitude < 0) {
          deniveleNTotal -= point.altitude - previousAltitude;
        }
        previousAltitude = point.altitude;
      }
    }
    //console.log("D+ / D- :", denivelePTotal, deniveleNTotal);
    const average_speed = calculateSpeedOrPace(
      data.sport,
      total_distance,
      all_total_time,
      "int"
    );

    //console.log("date / semaine :", dateActivite, semaineActivite);

    return {
      sport: data.sport,
      date: dateActivite,
      semaine: semaineActivite,
      distance: total_distance,
      temps: all_total_time,
      deniveleP: denivelePTotal,
      deniveleN: deniveleNTotal,
      vitesse: average_speed,
    };
  } catch (error) {
    console.error("Erreur dans readActivityData :", error);
    return null;
  }
}

function getWeekFromDate(dateString) {
  const date = new Date(dateString);

  // Copier la date et la mettre au jeudi de cette semaine (ISO 8601)
  const target = new Date(date.valueOf());
  const day = (date.getDay() + 6) % 7; // Lundi = 0, Dimanche = 6
  target.setDate(target.getDate() - day + 3);

  // 1er jeudi de l'année
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDay + 3);

  // Numéro de semaine
  const weekNumber = 1 + Math.round((target - firstThursday) / 604800000);

  return weekNumber;
}
