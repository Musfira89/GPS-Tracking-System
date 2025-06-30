import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import { Dialog } from "@headlessui/react";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import { fetchLatestData } from "../utils/fetchLatestData";
import markerImg from "../assets/marker.png";
import SensorCards from "./Cards";

const center = { lat: 24.927, lng: 67.0835 };
const ORS_API_KEY = "5b3ce3597851110001cf6248bc515ab8ab4e4de2ab3a678c49f717e8";

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
  if (timestamp === "Start Point") return "Start Point";
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

const getDistance = (a, b) => {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
};

const getSnappedPath = async (coords) => {
  if (coords.length < 2) return coords;
  try {
    const body = {
      coordinates: coords.map((p) => [p.lng, p.lat]),
    };
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_API_KEY,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data.features[0].geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
    }));
  } catch (err) {
    console.error("ORS error:", err);
    return coords;
  }
};

const LiveGPSMarker = ({ gpsData, setFilteredPath }) => {
  const map = useMap();
  const lastPoint = useRef(null);

  useEffect(() => {
    if (
      gpsData &&
      typeof gpsData.latitude === "number" &&
      typeof gpsData.longitude === "number"
    ) {
      const newPoint = { lat: gpsData.latitude, lng: gpsData.longitude };

      if (!lastPoint.current) {
        // First location: store to localStorage as initial point
        localStorage.setItem(
          "initialPoint",
          JSON.stringify({
            ...newPoint,
            timestamp: gpsData.timestamp,
            speed: gpsData.speed || 0,
          })
        );
      }

      if (!lastPoint.current || getDistance(lastPoint.current, newPoint) >= 10) {
        setFilteredPath((prev) => {
          const updated = [...prev, newPoint];
          localStorage.setItem("gpsPath", JSON.stringify(updated));
          return updated;
        });
        lastPoint.current = newPoint;
        map.setView([newPoint.lat, newPoint.lng], 14);
      }
    }
  }, [gpsData, setFilteredPath, map]);

  return null;
};

const MapControls = ({ clearPath }) => {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <button
        className="bg-gray-800 text-white p-1.5 md:p-2 rounded-lg shadow text-xs"
        onClick={() => map.zoomIn()}
      >
        +
      </button>
      <button
        className="bg-gray-800 text-white p-1.5 md:p-2 rounded-lg shadow text-xs"
        onClick={() => map.zoomOut()}
      >
        −
      </button>
      <button
        className="bg-red-600 text-white p-1.5 md:p-2 rounded-lg shadow flex items-center gap-1 text-xs"
        onClick={clearPath}
      >
        <FaTrashAlt /> Clear
      </button>
    </div>
  );
};

const MapComponent = () => {
  const [gpsData, setGpsData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [location, setLocation] = useState("");
  const [path, setPath] = useState(() => {
    const saved = localStorage.getItem("gpsPath");
    return saved ? JSON.parse(saved) : [];
  });
  const [snappedPath, setSnappedPath] = useState([]);
  const [useStatic, setUseStatic] = useState(false);
  const [tileLayer, setTileLayer] = useState("map");

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

  useEffect(() => {
    (async () => {
      const coords = path;
      if (coords.length > 1) {
        const snapped = await getSnappedPath(coords);
        setSnappedPath(snapped);
      } else {
        setSnappedPath([]);
      }
    })();
  }, [path]);

  const clearPath = () => {
    setPath([]);
    setSnappedPath([]);
    localStorage.removeItem("gpsPath");
  };

  const openDialog = (data) => {
    setSelectedData(data);
    setIsDialogOpen(true);
  };

  const first = snappedPath[0];
  const last = snappedPath[snappedPath.length - 1];
  const initialData = JSON.parse(localStorage.getItem("initialPoint"));

  return (
    <div className="p-4 bg-gray-950 text-white h-full font-sans">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="w-full lg:w-[65%] bg-gray-900 p-4 rounded-2xl shadow-xl relative">
          <MapContainer
            center={initialData || center}
            zoom={14}
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
            <LiveGPSMarker gpsData={gpsData} setFilteredPath={setPath} />
            {snappedPath.length > 1 && <Polyline positions={snappedPath} color="red" />}
            {initialData && (
              <Marker
                position={{ lat: initialData.lat, lng: initialData.lng }}
                icon={customIcon}
                eventHandlers={{ click: () => openDialog(initialData) }}
              />
            )}
            {last && (
              <Marker
                position={last}
                icon={customIcon}
                eventHandlers={{ click: () => openDialog(gpsData) }}
              />
            )}
            <MapControls clearPath={clearPath} />
          </MapContainer>
        </div>

        <div className="w-full lg:w-[35%]">
          <SensorCards graphData={graphData} />
        </div>
      </div>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <Dialog.Panel className="bg-gradient-to-r from-[#10141f] via-[#1c2534] to-[#141f28] text-white p-4 py-8 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-[90%] sm:max-w-sm md:max-w-[450px]">
            <Dialog.Title className="text-2xl font-bold mb-6 text-center leading-snug tracking-wider">
              GPS INFO
            </Dialog.Title>
            <div className="space-y-5 leading-relaxed p-4 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Latitude:</span>
                <span className="text-gray-300">{selectedData?.lat || selectedData?.latitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Longitude:</span>
                <span className="text-gray-300">{selectedData?.lng || selectedData?.longitude}</span>
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
                <span className="text-gray-300">{formatTimestamp(selectedData?.timestamp)}</span>
              </div>
              <div className="flex justify-between gap-12">
                <span className="font-semibold">Location:</span>
                <span className="text-gray-300 text-right break-words">{location}</span>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MapComponent;
