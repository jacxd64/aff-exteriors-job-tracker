import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing    from "./Landing";
import Directory  from "./Directory";
import CreateJob  from "./CreateJob";      // NEW
import JobDetail  from "./JobDetail";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/"          element={<Landing   />} />
      <Route path="/jobs"      element={<Directory />} />
      <Route path="/jobs/new"  element={<CreateJob />} />   {/* NEW */}
      <Route path="/jobs/:id"  element={<JobDetail />} />
    </Routes>
  </BrowserRouter>
);
