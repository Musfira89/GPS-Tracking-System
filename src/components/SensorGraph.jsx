import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { fetchGraphData } from "../utils/fetchGraphData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorGraph = () => {
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] });
  const [latestDate, setLatestDate] = useState("");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchGraphData();
      if (data) {
        setGraphData({ labels: data.labels, datasets: data.datasets });
        setLatestDate(data.latestDate);
      }
    };
    getData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sensor Data (Last 2.5 Minutes)" },
    },
    scales: {
      x: {
        title: { display: true, text: "Time (AM/PM)" },
      },
      y: {
        title: { display: true, text: "Value" },
      },
    },
  };

  return (
    <div className="p-6 bg-gray-950 text-white rounded-xl shadow-xl">
      <h2 className="text-xl font-semibold mb-2">Sensor Data Graph</h2>
      {latestDate && (
        <p className="text-sm text-gray-400 mb-4">Date: {latestDate}</p>
      )}
      <Line data={graphData} options={options} />
    </div>
  );
};


export default SensorGraph;
