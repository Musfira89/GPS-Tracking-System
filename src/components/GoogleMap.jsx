import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import { Dialog } from "@headlessui/react";
import { FaExpand, FaSatelliteDish, FaTimes } from "react-icons/fa";
import { fetchLatestData } from "../utils/fetchLatestData";
import markerImg from "../assets/marker.png";
import SensorCards from "./Cards";

const center = { lat: 24.927, lng: 67.0835 };

const customIcon = new Icon({
  iconUrl: markerImg,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const getLocationFromCoordinates = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    const address = data?.address;
    if (address) {
      const { road, city, country } = address;
      return `${road || ""}, ${city || ""}, ${country || ""}`;
    }
    return "Location not found";
  } catch (err) {
    return "Error retrieving location";
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Invalid timestamp";

  const [date, time] = timestamp.split(" ");
  const [year, month, day] = date.split("-");
  const [hours, minutes, seconds] = time.split("-");

  const dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

  const formattedDate = dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateObject
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${formattedDate}, ${formattedTime}`;
};

const LiveGPSMarker = ({ gpsData, onMarkerClick }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (
      gpsData &&
      typeof gpsData.latitude === "number" &&
      typeof gpsData.longitude === "number"
    ) {
      const { latitude, longitude } = gpsData;
      const newPosition = { lat: latitude, lng: longitude };
      setPosition(newPosition);
      map.flyTo([latitude, longitude], 14, { animate: true });
    }
  }, [gpsData, map]);

  return position ? (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{ click: () => onMarkerClick(gpsData) }}
    />
  ) : null;
};

const MapControls = ({ setTileLayer }) => {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <button
        className="bg-gray-800 text-white p-2 rounded-lg shadow hover:bg-gray-700 transition"
        onClick={() => map.zoomIn()}
      >
        ➕
      </button>
      <button
        className="bg-gray-800 text-white p-2 rounded-lg shadow hover:bg-gray-700 transition"
        onClick={() => map.zoomOut()}
      >
        ➖
      </button>
      <button
        className="bg-gray-800 text-white p-2 rounded-lg shadow hover:bg-gray-700 transition flex items-center gap-2"
        onClick={() =>
          setTileLayer((prev) => (prev.includes("sat") ? "map" : "sat"))
        }
      >
        <FaSatelliteDish /> 🛰
      </button>
      <button
        className="bg-gray-800 text-white p-2 rounded-lg shadow hover:bg-gray-700 transition"
        onClick={() => map.invalidateSize()}
      >
        <FaExpand />
      </button>
    </div>
  );
};

const MapComponent = () => {
  const [tileLayer, setTileLayer] = useState("map");
  const [gpsData, setGpsData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const gpsResponse = await fetchLatestData();

      if (
        gpsResponse &&
        typeof gpsResponse.latitude === "number" &&
        typeof gpsResponse.longitude === "number"
      ) {
        setGpsData(gpsResponse);

        const resolvedLocation = await getLocationFromCoordinates(
          gpsResponse.latitude,
          gpsResponse.longitude
        );
        setLocation(resolvedLocation);
      }

      const graphResponse = await fetchLatestData();
      setGraphData(graphResponse);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const openDialog = (data) => {
    setSelectedData(data);
    setIsDialogOpen(true);
  };

  if (!gpsData) {
    return (
      <div className="p-4 bg-gray-950 text-white h-full font-sans">
        <div>Loading GPS Data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-950 text-white h-full font-sans">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="w-full lg:w-[65%] bg-gray-900 p-4 rounded-2xl shadow-xl relative">
          <MapContainer
            center={center}
            zoom={2}
            zoomControl={false}
            style={{ height: "320px", borderRadius: "0.75rem", zIndex: 1 }}
          >
            <TileLayer
              url={
                tileLayer === "map"
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              }
            />
            {gpsData && (
              <LiveGPSMarker gpsData={gpsData} onMarkerClick={openDialog} />
            )}
            <MapControls setTileLayer={setTileLayer} />
          </MapContainer>
        </div>

        <div className="w-full lg:w-[35%]">
          <SensorCards graphData={graphData} />
        </div>
      </div>

      {/* Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <Dialog.Panel className="bg-gradient-to-r from-[#10141f] via-[#1c2534] to-[#141f28] text-white p-12 py-14 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-md transition-transform transform duration-300 ease-in-out">
            <Dialog.Title className="text-2xl font-bold mb-6 text-center leading-snug tracking-wider text-gray-100">
              GPS INFO
            </Dialog.Title>

            <div className="space-y-4 text-base leading-relaxed">
              <div className="flex justify-between">
                <span className="font-semibold">Latitude:</span>
                <span className="text-gray-300">{selectedData?.latitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Longitude:</span>
                <span className="text-gray-300">{selectedData?.longitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Speed:</span>
                <span className="text-gray-300">
                  {selectedData?.speed !== undefined
                    ? `${(selectedData.speed * 3.6).toFixed(2)} km/h`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Timestamp:</span>
                <span className="text-gray-300">
                  {formatTimestamp(selectedData?.timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Location:</span>
                <span className="text-gray-300 ml-22 text-right">
                  {location}
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-white transition-all duration-200 ease-in-out"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MapComponent;
