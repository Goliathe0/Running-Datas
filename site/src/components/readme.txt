📁 components/

→ Tes briques visuelles si tu fais du front (surtout avec React, Vue, Svelte, etc.)

Exemples :

// src/components/MapView.jsx
export default function MapView({ activities }) {
  return <div id="map">Carte des activités</div>;
}


C’est ici que tu ranges :

Les éléments graphiques réutilisables (Button, Header, MapView)

Chaque composant a son propre fichier

💡 Si un composant est complexe, tu peux lui donner un sous-dossier :

components/
  ├── MapView/
  │   ├── index.jsx
  │   └── mapUtils.js