import { useState, useEffect, useMemo } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Use the real-time listener to fetch and update data
    const unsubscribe = fetchGraphData((data) => {
      if (data) {
        setGraphData({ labels: data.labels, datasets: data.datasets });
        setLatestDate(data.latestDate);
      }
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: isMobile ? "bottom" : "top",
        labels: {
          boxWidth: 12,
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Sensor Data (Last 2.5 Minutes)",
        font: {
          size: isMobile ? 14 : 16,
        },
      },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (AM/PM)",
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: isMobile ? 4 : 8,
          font: {
            size: isMobile ? 9 : 11,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        ticks: {
          font: {
            size: isMobile ? 9 : 11,
          },
        },
        beginAtZero: false,
      },
    },
  }), [isMobile]);

  return (
    <div className="p-4 sm:p-6 bg-gray-950 text-white rounded-xl shadow-xl w-full max-w-6xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-2">Sensor Data Graph</h2>
      {latestDate && (
        <p className="text-xs sm:text-sm text-gray-400 mb-4">Date: {latestDate}</p>
      )}
      <div className="w-full min-h-[300px] sm:min-h-[400px] relative">
        <Line data={graphData} options={options} />
      </div>
    </div>
  );
};

export default SensorGraph;
