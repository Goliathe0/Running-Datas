📁 hooks/ (si tu utilises React)

→ Les fonctions spéciales qui gèrent un état ou un comportement logique.

Exemples :

// src/hooks/useActivities.js
import { useEffect, useState } from "react";
import { fetchActivities } from "../api/fetchActivities.js";

export function useActivities() {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    fetchActivities().then(setActivities);
  }, []);
  return activities;
}


Les hooks te permettent de :

Centraliser des comportements (chargement de données, gestion du scroll, etc.)

Réutiliser facilement des logiques complexes entre composants