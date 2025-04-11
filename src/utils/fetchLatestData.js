// src/utils/fetchLatestData.js
import { db } from "./firebaseConfig";
import { ref, get, child } from "firebase/database";

export const fetchLatestData = async () => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, "TrackingData"));
    if (snapshot.exists()) {
      const data = snapshot.val();

      // Get latest date and time
      const latestDate = Object.keys(data).sort().reverse()[0];
      const latestTime = Object.keys(data[latestDate]).sort().reverse()[0];
      const sensorData = data[latestDate][latestTime];

      return {
        ...sensorData,
        timestamp: `${latestDate} ${latestTime}`,
      };
    } else {
      console.log("No data found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
