src/
├── api/
│   └── fetchActivities.js          → lit les fichiers JSON
│
├── components/
│   ├── ActivityTable.jsx            → affiche les activités
│   ├── MapView.jsx                  → affiche la carte
│   └── Header.jsx                   → titre + menu
│
├── hooks/
│   └── useActivities.js             → charge les activités avec fetchActivities()
│
├── utils/
│   ├── distance.js                  → calcule la distance totale
│   ├── speed.js                     → calcule les vitesses
│   └── format.js                    → formate dates ou durées
│
├── data/
│   └── activities.json              → données locales
│
└── index.js                         → point d’entrée principal (monte les composants)
