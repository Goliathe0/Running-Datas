function getStatsFromActivities(activities) {
  if (!activities || activities.length === 0) {
    return {
      nbActivities: 0,
      distanceMoyenne: 0,
      vitesseMoyenne: 0,
      distanceTotale: 0,
      tempsTotal: 0,
      denivelePTotal: 0,
      deniveleNTotal: 0,
    };
  }
  //console.log("activities in getSats:", activities);
  const totalDistance = activities.reduce(
    (sum, a) => sum + (a.distance || 0), //x = distance
    0
  );
  const totalVitesse = activities.reduce((sum, a) => sum + (a.vitesse || 0), 0); //y = vitesse
  //const vitesseMax = Math.max(...activities.map((a) => a.vitesse || 0));
  //revoir totaltemps
  const totalTemps = activities.reduce((sum, a) => sum + (a.temps || 0), 0);
  const totalDeniveleP = activities.reduce(
    (sum, a) => sum + (a.deniveleP || 0),
    0
  );
  const totalDeniveleN = activities.reduce(
    (sum, a) => sum + (a.deniveleN || 0),
    0
  );
  return {
    nbActivities: activities.length,
    distanceMoyenne: totalDistance / activities.length,
    vitesseMoyenne: totalVitesse / activities.length,
    distanceTotale: totalDistance,
    tempsTotal: totalTemps,
    denivelePTotal: totalDeniveleP,
    deniveleNTotal: totalDeniveleN,
  };
}
