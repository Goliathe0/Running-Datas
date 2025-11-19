📁 api/

→ Tout ce qui concerne la communication avec l’extérieur (serveur, fichiers, etc.)

Exemples :

// src/api/fetchActivities.js
export async function fetchActivities() {
  const res = await fetch('/data/activities.json');
  return await res.json();
}


C’est ici que tu mets :

Les appels à des API (REST, Strava, etc.)

Les fonctions d’accès à des fichiers locaux (fetch, axios, etc.)