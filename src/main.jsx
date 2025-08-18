// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./Landing";
import Directory from "./Directory";
import CreateJob from "./CreateJob";
import JobDetail from "./JobDetail";
import Favorites from "./Favorites";
import Calendar from "./Calendar";
import SearchPage from "./SearchPage";
import Templates from "./Templates";
import NavBar from "./NavBar";
import Login from "./Login";
import AuthProvider, { useAuth } from "./AuthProvider";
import "./App.css";

/* ---------------------------------------------------------------------------
   Whitelist — only these Gmail accounts can access the app
--------------------------------------------------------------------------- */
const ALLOWED = [
  "affordableexteriorsstl@gmail.com",
  "affordableexteriorsdb@gmail.com",
  "j.m.griesenauer@gmail.com",
  "lgriesenauer@gmail.com",
  "mjjg64@gmail.com"
];

/* ---------------------------------------------------------------------------
   Gate component — decides what to show based on auth + whitelist
--------------------------------------------------------------------------- */
function Gate() {
  const { user, logout } = useAuth();

  /* ---- 1. not signed-in → login page only ---- */
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  /* ---- 2. signed-in but not whitelisted ---- */
  if (!ALLOWED.includes(user.email)) {
    return (
      <div className="centerbox">
        <p style={{ fontSize: "1.2rem" }}>Access denied for {user.email}</p>
        <button className="bigbtn" onClick={logout}>Sign out</button>
      </div>
    );
  }

  /* ---- 3. whitelisted → full app + nav bar ---- */
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/jobs" element={<Directory />} />
        <Route path="/jobs/new" element={<CreateJob />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* placeholder pages */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/templates" element={<Templates />} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Render tree
--------------------------------------------------------------------------- */
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Gate />
    </BrowserRouter>
  </AuthProvider>
);
