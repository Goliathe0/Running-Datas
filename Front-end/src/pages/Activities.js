// src/pages/activities.js

async function initActivitiesPage() {
  const index_file_path = `/SportsData/Front-end/src/data/activities_json/index.json`;
  await fillTable(index_file_path);
}

document.addEventListener("DOMContentLoaded", initActivitiesPage);
