import React from 'react';
import device from '../assets/device.png';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import WifiIcon from '@mui/icons-material/Wifi';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DeviceStatus = () => {
  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4 sm:p-6 md:p-8 bg-gray-950 rounded-2xl shadow-xl border border-gray-800 font-sora">
      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
        <img
          src={device}
          alt="Device"
          className="w-32 sm:w-40 md:w-48 h-auto object-contain transition-transform duration-300 hover:scale-105"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
          Device Status
        </h2>

        <div className="w-full space-y-4 sm:space-y-5">
          <StatusCard
            icon={<BatteryFullIcon className="text-green-400" />}
            label="Battery"
            value="87%"
            valueColor="text-green-400"
          />
          <StatusCard
            icon={<WifiIcon className="text-blue-400" />}
            label="Status"
            value="Active"
            valueColor="text-blue-400"
          />
          <StatusCard
            icon={<AccessTimeIcon className="text-yellow-400" />}
            label="Last Updated"
            value="11-Apr-2025 4:52PM"
            valueColor="text-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ icon, label, value, valueColor }) => (
  <div className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-4 sm:py-4 shadow-inner hover:bg-gray-800 transition-colors">
    <div className="flex items-center gap-2 sm:gap-3 text-gray-200 text-sm sm:text-base font-medium">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-semibold text-sm sm:text-base ${valueColor}`}>{value}</span>
  </div>
);

export default DeviceStatus;
