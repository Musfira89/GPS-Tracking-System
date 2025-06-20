import React, { useEffect, useState } from "react";
import device from "../assets/device.png";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import WifiIcon from "@mui/icons-material/Wifi";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { fetchLatestData } from "../utils/fetchLatestData";

const DeviceStatus = () => {
  const [status, setStatus] = useState("Loading...");
  const [lastUpdated, setLastUpdated] = useState("Fetching...");
  const [battery, setBattery] = useState("Fetching...");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchLatestData();
      if (data) {
        setStatus(data.status || "Unknown");
        setBattery(data.battery ? `${data.battery}%` : "Unavailable");
        setLastUpdated(formatTimestamp(data.timestamp));
      } else {
        setStatus("Unavailable");
        setBattery("Unavailable");
        setLastUpdated("N/A");
      }
    };

    getData();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Invalid timestamp";

    const [date, time] = timestamp.split(" ");
    if (!date || !time) return "Invalid timestamp format";

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split("-").map(Number);

    // Ensure hour, minute, and date values are valid
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hour) ||
      isNaN(minute)
    ) {
      return "Invalid timestamp values";
    }

    const formattedDate = new Date(year, month - 1, day, hour, minute, 0);
    if (isNaN(formattedDate.getTime())) return "Invalid Date";

    return formattedDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto p-3 sm:p-12 md:p-8 bg-gray-950 rounded-2xl shadow-xl border border-gray-800 font-sora">
      <div className="flex flex-col items-center text-center space-y-3 sm:space-y-6 text-xs sm:text-sm">
        <img
          src={device}
          alt="Device"
          className="w-28 sm:w-40 md:w-48 h-auto object-contain transition-transform duration-300 hover:scale-105"
        />
        <h2 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
          Device Status
        </h2>

        <div className="w-full space-y-3 sm:space-y-5">
          <StatusCard
            icon={<BatteryFullIcon className="text-green-400" />}
            label="Battery"
            value={battery}
            valueColor="text-green-400"
          />

          <StatusCard
            icon={<WifiIcon className="text-blue-400" />}
            label="Status"
            value={status}
            valueColor={status === "Active" ? "text-blue-400" : "text-red-400"}
          />
          <StatusCard
            icon={<AccessTimeIcon className="text-yellow-400" />}
            label="Last Updated : "
            value={lastUpdated}
            valueColor="text-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ icon, label, value, valueColor }) => (
  <div className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-4 shadow-inner hover:bg-gray-800 transition-colors">
    <div className="flex items-center gap-2 sm:gap-3 text-gray-200 text-xs sm:text-sm font-medium">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-semibold text-sm sm:text-xs ${valueColor}`}>
      {value}
    </span>
  </div>
);

export default DeviceStatus;
