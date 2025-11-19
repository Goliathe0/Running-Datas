📁 utils/

→ Tes fonctions utilitaires (non liées à l’affichage, ni à une API spécifique).

Exemples :

// src/utils/math.js
export function averageSpeed(distances, times) {
  const totalDist = distances.reduce((a, b) => a + b);
  const totalTime = times.reduce((a, b) => a + b);
  return totalDist / totalTime;
}


Ce sont souvent des fonctions “pures”, réutilisables partout :

Calculs

Conversions (km ↔ mph, format de date, etc.)

Fonctions communes à plusieurs modules