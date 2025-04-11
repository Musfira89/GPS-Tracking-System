// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Topbar from "./components/Topbar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Topbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;