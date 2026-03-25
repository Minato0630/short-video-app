import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import UserProfile from "./pages/UserProfile"; // ✅ FIX: IMPORT ADDED
import Login from "./pages/Login";
import Register from "./pages/Register";
import API_URL from "./utils/api";

function App() {
  const [videos, setVideos] = useState([]);

  /* ===============================
     LOAD ALL VIDEOS
  =============================== */
  const loadVideos = async () => {
    try {
const res = await axios.get(`${API_URL}/api/videos`);
      setVideos(res.data);
    } catch (err) {
      console.error("Failed to load videos", err);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={<Home videos={videos} refresh={loadVideos} />}
        />

        {/* UPLOAD */}
        <Route
          path="/upload"
          element={<Upload onUpload={loadVideos} />}
        />

        {/* USER PROFILE (PUBLIC + OWN PROFILE) */}
        <Route
          path="/user/:username"
          element={<UserProfile />}
        />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
