// src/SearchPage.jsx
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import JobCard from "./components/JobCard";

export default function SearchPage() {
  const [jobs, setJobs] = useState([]);
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // debounce text to keep UI snappy
  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [text]);

  // Auto-collect current project types (future-proof for your upcoming tags/filters)
  const projectTypes = useMemo(() => {
    const s = new Set();
    for (const j of jobs) {
      const pt = j.projectType || j.jobType || j.type;
      if (pt) s.add(String(pt));
    }
    return ["ALL", ...Array.from(s).sort()];
  }, [jobs]);

  const filtered = useMemo(() => {
    const matchText = (j) => {
      if (!debounced) return true;
      const fields = [
        j.name, j.homeowner, j.customerName, j.title,
        j.address, j.street, j.city
      ].filter(Boolean).map(v => String(v).toLowerCase());
      return fields.some(f => f.includes(debounced));
    };

    const matchType = (j) => {
      if (typeFilter === "ALL") return true;
      const pt = j.projectType || j.jobType || j.type || "";
      return String(pt) === typeFilter;
    };

    return jobs.filter(j => matchText(j) && matchType(j));
  }, [jobs, debounced, typeFilter]);

  return (
    <div className="searchPage">
      <div className="searchBar" style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        <input
          className="searchInput"
          placeholder="Search by homeowner or address…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", fontSize: "1rem" }}
        />
        <select
          className="searchSelect"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: "10px 12px", fontSize: "1rem" }}
        >
          {projectTypes.map((pt) => (
            <option key={pt} value={pt}>
              {pt === "ALL" ? "All project types" : pt}
            </option>
          ))}
        </select>
      </div>

      <div className="masonry">
        {filtered.map(j => <JobCard key={j.id} job={j} />)}
        {filtered.length === 0 && (
          <div className="centerbox" style={{ marginTop: 24 }}>
            No matching jobs.
          </div>
        )}
      </div>
    </div>
  );
}
