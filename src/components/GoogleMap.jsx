import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import { FaExpand, FaSatelliteDish } from "react-icons/fa";
import { fetchLatestData } from "../utils/fetchLatestData"; // Importing the new utility
import markerImg from "../assets/marker.png"; // Add marker image in assets folder
import SensorCards from "./Cards"; // Adjust the path if needed

// Map center and custom icon
const center = { lat: 24.927, lng: 67.0835 };
const customIcon = new Icon({
  iconUrl: markerImg,
  iconSize: [30, 30], // Reduced icon size
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Live GPS Marker component
const LiveGPSMarker = ({ gpsData }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const [popupContent, setPopupContent] = useState(null); // To store popup content

  useEffect(() => {
    if (gpsData) {
      const { latitude, longitude } = gpsData;
      setPosition({ lat: latitude, lng: longitude });
      map.flyTo([latitude, longitude], 14, { animate: true }); // Ensures smoother zoom without zoom-out
    }
  }, [gpsData, map]);

  const handleMarkerClick = () => {
    const { latitude, longitude, speed, timestamp } = gpsData;
    setPopupContent(
      <div>
        <p>
          <b>Lat:</b> {latitude}
        </p>
        <p>
          <b>Lng:</b> {longitude}
        </p>
        <p>
          <b>Time:</b> {timestamp}
        </p>
        <p>
          <b>Speed:</b> {speed} km/h
        </p>
      </div>
    );
  };

  return position ? (
    <Marker
      position={position}
      icon={customIcon}
      eventHandlers={{ click: handleMarkerClick }}
    >
      <Popup>{popupContent}</Popup>
    </Marker>
  ) : null;
};

// MapControls component for zooming and layer switching
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

// Main MapComponent with Map and Sensor Cards
const MapComponent = () => {
  const [tileLayer, setTileLayer] = useState("map");
  const [gpsData, setGpsData] = useState(null);
  const [graphData, setGraphData] = useState(null); // For environmental data

  // Fetch the latest GPS and environment data
  useEffect(() => {
    const fetchData = async () => {
      const gpsResponse = await fetchLatestData(); // Assuming you still fetch GPS data like before
      setGpsData(gpsResponse);

      const graphResponse = await fetchLatestData();
      setGraphData(graphResponse);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Update data every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  if (!gpsData) {
    return (
      <div className="p-4 bg-gray-950 text-white h-full font-sans">
        <div>Loading GPS Data...</div> {/* Fallback UI */}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-950 text-white h-full font-sans">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Map Section */}
        <div className="w-full lg:w-[45%] bg-gray-900 p-4 rounded-2xl shadow-xl relative">
          <MapContainer
            center={center}
            zoom={2}
            zoomControl={false}
            style={{ height: "320px", borderRadius: "0.75rem" }} // Increased height of the map
          >
            <TileLayer
              url={
                tileLayer === "map"
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              }
            />
            {gpsData && <LiveGPSMarker gpsData={gpsData} />}
            <MapControls setTileLayer={setTileLayer} />
          </MapContainer>
        </div>

        {/* Sensor Cards Section */}
        <SensorCards graphData={graphData} />
      </div>
    </div>
  );
};

export default MapComponent;
