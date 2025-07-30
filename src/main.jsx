// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing    from "./Landing";
import Directory  from "./Directory";
import CreateJob  from "./CreateJob";
import JobDetail  from "./JobDetail";
import Login      from "./Login";
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

  // not signed-in → show Login route only
  if (!user)
    return <Routes><Route path="*" element={<Login/>}/></Routes>;

  // signed-in but NOT whitelisted → access denied
  if (!ALLOWED.includes(user.email)) {
    return (
      <div className="centerbox">
        <p style={{fontSize:"1.2rem"}}>Access denied for {user.email}</p>
        <button className="bigbtn" onClick={logout}>Sign out</button>
      </div>
    );
  }

  // whitelisted → full app routes
  return (
    <Routes>
      <Route path="/"          element={<Landing   />} />
      <Route path="/jobs"      element={<Directory />} />
      <Route path="/jobs/new"  element={<CreateJob />} />
      <Route path="/jobs/:id"  element={<JobDetail />} />
      <Route path="*"          element={<Landing   />} />
    </Routes>
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
