// src/utils/fetchGraphData.js

import { db } from "./firebaseConfig";
import { ref, get, child } from "firebase/database";

// Fetch data based on the selected time range
export const fetchGraphData = async (timeRange) => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, "TrackingData"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const currentDate = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format
      const currentHour = new Date().getHours(); // Get the current hour

      let graphData = null;

      switch (timeRange) {
        case "current":
          // Fetch data for the current hour
          graphData = data[currentDate] && data[currentDate][currentHour];
          break;

        case "last12hours":
          // Fetch data for the last 12 hours
          graphData = getRecentData(data, 12);
          break;

        case "last24hours":
          // Fetch data for the last 24 hours (2 days, but only a few hours)
          graphData = getRecentData(data, 24);
          break;

        default:
          graphData = null;
          break;
      }

      if (graphData) {
        return prepareGraphData(graphData);
      } else {
        console.log("No data found.");
        return null;
      }
    } else {
      console.log("No data found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// Helper function to prepare the graph data
const prepareGraphData = (data) => {
  const labels = [];
  const temperatureData = [];
  const humidityData = [];
  const pressureData = [];

  // Loop through all seconds to get data
  Object.keys(data).forEach((timeKey) => {
    const time = new Date(timeKey);
    const timestamp = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    labels.push(timestamp);
    temperatureData.push(data[timeKey].temperature);
    humidityData.push(data[timeKey].humidity);
    pressureData.push(data[timeKey].pressure);
  });

  return {
    labels,
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
        label: "Pressure (hPa)",
        data: pressureData,
        borderColor: "#3498DB",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
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
};

// Helper function to get the recent data for a given time range (in hours)
const getRecentData = (data, hours) => {
  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date in 'YYYY-MM-DD' format
  const recentData = {};

  // Loop over the data to collect the last `hours` of data
  const dateKeys = Object.keys(data);
  for (let date of dateKeys) {
    if (date === currentDate) {
      // Filter data for the last `hours` from the current day
      const hoursData = data[date];
      const currentHour = new Date().getHours();
      const startHour = currentHour - hours;

      for (let hour = startHour; hour <= currentHour; hour++) {
        if (hoursData[hour]) {
          recentData[hour] = hoursData[hour];
        }
      }
    } else if (date < currentDate) {
      // Only get the last `hours` data from previous days
      const hoursData = data[date];
      const hourKeys = Object.keys(hoursData);
      for (let hour of hourKeys) {
        if (recentData[hour]) {
          recentData[hour] = hoursData[hour];
        }
      }
    }
  }

  return recentData;
};
