import GoogleMap from "../components/GoogleMap";
import SensorGraph from "../components/SensorGraph";
import DeviceStatus from "../components/DeviceStatus";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0a0a0f] to-[#111827] text-white flex flex-col">
      {/* Map Component (Full Width) */}
      <div className="w-full h-1/2 p-0">
        <GoogleMap />
      </div>

      {/* Bottom Section (70% width Graph, 30% width DeviceStatus) */}
      {/* Bottom Section (70% width Graph, 30% width DeviceStatus) */}
      <div className="flex flex-col lg:flex-row gap-6 w-full p-6 flex-1">
        {/* Sensor Graph (70% width) */}
        <div className="lg:w-[70%] w-full p-0 bg-transparent">
          <SensorGraph />
        </div>

        {/* Device Status (30% width) */}
        <div className="lg:w-[30%] w-full p-0 bg-transparent">
          <DeviceStatus />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
