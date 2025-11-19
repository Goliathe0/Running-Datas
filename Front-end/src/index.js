import { useActivities } from "./hooks/useActivities.js";
import MapView from "./components/MapView.jsx";
import ActivityTable from "./components/ActivityTable.jsx";

function App() {
  const activities = useActivities();
  return (
    <>
      <MapView activities={activities} />
      <ActivityTable activities={activities} />
    </>
  );
}
