import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { fetchGraphData } from "../utils/fetchGraphData"; // Import the utility function
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SensorGraph = () => {
  const [timeRange, setTimeRange] = useState("current");
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [
      {
        label: "Temperature (°C)",
        data: [],
        borderColor: "#FF5733",
        backgroundColor: "rgba(255, 87, 51, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Pressure (hPa)",
        data: [],
        borderColor: "#3498DB",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Humidity (%)",
        data: [],
        borderColor: "#2ECC71",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  });

  // Fetch graph data whenever time range changes
  useEffect(() => {
    const getData = async () => {
      const data = await fetchGraphData(timeRange);
      if (data) {
        setGraphData(data);
      }
    };
    getData();
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sensor Data Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  return (
    <div className="p-6 bg-gray-950 text-white rounded-xl shadow-xl">
      <h2 className="text-xl font-semibold mb-4">Sensor Data Graph</h2>

      {/* Dropdown to select time range */}
      <div className="mb-4 flex justify-between items-center">
        <select
          value={timeRange}
          onChange={handleTimeRangeChange}
          className="bg-gray-800 text-white p-2 rounded-lg border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="current">Current Hour</option>
          <option value="last12hours">Last 12 Hours</option>
          <option value="last24hours">Last 24 Hours</option>
        </select>
        <p className="text-sm text-gray-400">Select Data Range</p>
      </div>

      {/* Graph */}
      <Line data={graphData} options={options} />
    </div>
  );
};

export default SensorGraph;
