// src/components/Cards.jsx
import React, { useEffect, useState } from "react";
import temperatureImg from "../assets/temperature.webp";
import pressureImg from "../assets/pressure.png"; // Placeholder since no pressure data in Firebase
import humidityImg from "../assets/humidity.jpg";
import { fetchLatestData } from "../utils/fetchLatestData";

const SensorCards = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    fetchLatestData().then((data) => {
      setSensorData(data);
    });
  }, []);

  if (!sensorData) {
    return <p className="text-white">Loading data...</p>;
  }

  const formatTimestamp = (timestamp) => {
    const [date, time] = timestamp.split(" ");
    const [year, month, day] = date.split("-");
    const [hours, minutes, seconds] = time.split("-");
  
    const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);
  
    const formattedDate = dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }); // Example: "April 9, 2025"
  
    const formattedTime = dateObject.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase(); // Example: "4:57 pm"
  
    return `${formattedDate}, ${formattedTime}`;
  };
  
  

  // Dynamically creating the sensor cards
  const sensorCards = [
    {
      label: "Temperature",
      value: `${sensorData.temperature}°C`,
      status: sensorData.deviceOn ? "Live" : "Inactive", 
      img: temperatureImg,
      color: "text-rose-400",
    },
    {
      label: "Humidity",
      value: `${sensorData.humidity}%`,
      status: sensorData.deviceOn ? "Live" : "Inactive",  
      img: humidityImg,
      color: "text-emerald-400",
    }

  ];

  return (
    <div className="w-full lg:w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sensorCards.map((sensor, idx) => (
        <div
          key={idx}
          className="bg-gray-900 p-5 rounded-2xl shadow-xl border border-gray-800 flex flex-col items-center justify-center transition hover:border-gray-700 hover:shadow-xl relative"
          style={{ height: "340px" }}
        >
          <img
            src={sensor.img}
            alt={sensor.label}
            className="w-20 h-20 object-contain mb-4"
          />
          <p className="text-sm text-gray-400 tracking-wide uppercase">
            {sensor.label}
          </p>
          <p className={`text-3xl font-semibold mt-2 ${sensor.color}`}>
            {sensor.value}
          </p>
  
          <p className="text-sm text-gray-300 mt-3 bg-gray-800 px-4 py-1 rounded-full">
            {sensor.status}
          </p>
  
          <p className="absolute bottom-2 center text-xs text-gray-300 mr-3 mb-3">
            Last updated: {formatTimestamp(sensorData.timestamp)}
          </p>
        </div>
      ))}
    </div>
  );
  
};

export default SensorCards;
