fetch(
  "C:UsersshumbOneDriveDocumentsVisual Studio CodeRunning Datassiteactivites.json"
)
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("liste-activites");
    data.forEach((act, i) => {
      const div = document.createElement("div");
      div.className = "activite";
      div.innerHTML = `
        <h2>Activité ${i + 1} — ${act.sport}</h2>
        <p><strong>Distance totale :</strong> ${act.laps
          .reduce((sum, lap) => sum + lap.distance, 0)
          .toFixed(1)} m</p>
        <p><strong>Durée totale :</strong> ${(
          act.laps.reduce((sum, lap) => sum + lap.total_time, 0) / 60
        ).toFixed(1)} min</p>
        <p><strong>Vitesse moyenne :</strong> ${(
          (act.laps.reduce((sum, lap) => sum + lap.distance, 0) /
            act.laps.reduce((sum, lap) => sum + lap.total_time, 0)) *
          3.6
        ).toFixed(2)} km/h</p>
      `;
      container.appendChild(div);
    });
  })
  .catch((err) => console.error(err));
