// src/Directory.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import JobCard from "./components/JobCard";
import { TRADE_OPTIONS } from "./constants";

export default function Directory() {
  const [jobs, setJobs] = useState([]);
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [tradeSet, setTradeSet] = useState(() => new Set());

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setJobs(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [text]);

  const toggleTrade = (t) => {
    setTradeSet(prev => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  };
  const clearTrades = () => setTradeSet(new Set());

  const filtered = useMemo(() => {
    const matchText = (j) => {
      if (!debounced) return true;
      const fields = [
        j.name, j.homeowner, j.customerName, j.title,
        j.address, j.street, j.city
      ].filter(Boolean).map(v => String(v).toLowerCase());
      return fields.some(f => f.includes(debounced));
    };
    const matchTrades = (j) => {
      if (tradeSet.size === 0) return true;
      const trades = Array.isArray(j.trades) ? j.trades : (j.projectType ? [String(j.projectType)] : []);
      return trades.some(tr => tradeSet.has(tr));
    };
    return jobs.filter(j => matchText(j) && matchTrades(j));
  }, [jobs, debounced, tradeSet]);

  return (
    <div>
      {/* Search + Trades filter */}
      <div className="searchBar" style={{ padding: "0 16px 16px", textAlign: "left" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="searchInput"
            placeholder="Search name or address…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1, padding: "10px 12px", fontSize: "1rem" }}
          />
          {tradeSet.size > 0 && (
            <button className="smallBtn" onClick={clearTrades} title="Clear trades">Clear</button>
          )}
        </div>

        <div className="tradeBank">
          {TRADE_OPTIONS.map(t => (
            <button
              key={t}
              className={"chip" + (tradeSet.has(t) ? " selected" : "")}
              onClick={() => toggleTrade(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="masonry">
        {filtered.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>

      <Link to="/jobs/new" className="fab">＋</Link>
    </div>
  );
}
