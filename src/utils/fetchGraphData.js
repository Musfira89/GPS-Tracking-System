import { db } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";

export const fetchGraphData = (callback) => {
  const dbRef = ref(db, "TrackingData");
  const unsubscribe = onValue(dbRef, (snapshot) => {
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
      const fiveMinutesAgo = new Date(latestTime.getTime() - 3 * 60 * 1000);

      const recentData = filteredData.filter((entry) => entry.time >= fiveMinutesAgo);

      const labels = recentData.map((entry) =>
        entry.time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );

      const temperatureData = recentData.map((entry) => entry.temperature);
      const humidityData = recentData.map((entry) => entry.humidity);

      // Call the callback function to update the graph data
      callback({
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
      });
    } else {
      console.log("No data found in Firebase.");
    }
  });

  return () => unsubscribe(); // Cleanup on component unmount
};
