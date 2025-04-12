import { db } from "./firebaseConfig";
import { ref, get, child } from "firebase/database";

export const fetchGraphData = async () => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, "TrackingData"));
    if (snapshot.exists()) {
      const data = snapshot.val();

      const dateKeys = Object.keys(data).sort();
      const latestDateKey = dateKeys[dateKeys.length - 1];
      const dayData = data[latestDateKey];

      const filteredData = Object.keys(dayData).map((timeKey) => {
        const [year, month, day] = latestDateKey.split("-");
        const [hour, minute, second] = timeKey.split("-");

        const timeStamp = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );

        const sensorData = dayData[timeKey];
        return { time: timeStamp, ...sensorData };
      });

      const latestTime = filteredData[filteredData.length - 1]?.time;
      const fiveMinutesAgo = new Date(latestTime.getTime() - 2.5 * 60 * 1000);

      const recentData = filteredData.filter((entry) => entry.time >= fiveMinutesAgo);

      // Show time only in AM/PM format
      const labels = recentData.map((entry) =>
        entry.time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );

      const temperatureData = recentData.map((entry) => entry.temperature);
      const humidityData = recentData.map((entry) => entry.humidity);
      const pressureData = recentData.map((entry) => entry.pressure);

      return {
        labels,
        latestDate: latestDateKey,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatureData,
            borderColor: "#FF5733",
            backgroundColor: "rgba(255, 87, 51, 0.2)",
            fill: true,
            tension: 0.4,
          },
         
          {
            label: "Humidity (%)",
            data: humidityData,
            borderColor: "#2ECC71",
            backgroundColor: "rgba(46, 204, 113, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    } else {
      console.log("No data found in Firebase.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
