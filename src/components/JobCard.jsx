// src/components/JobCard.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const toDate = (d) => {
  try {
    if (!d) return null;
    if (typeof d.toDate === "function") return d.toDate();
    return new Date(d);
  } catch { return null; }
};

const recentDate = (dlike) => {
  const d = toDate(dlike);
  if (!d || Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" })
  });
};

const tradesText = (job) => {
  const trades = Array.isArray(job.trades) ? job.trades : [];
  if (trades.length) return trades.join(", ");
  return job.projectType || job.jobType || job.type || job.city || "";
};

export default function JobCard({ job }) {
  const [busy, setBusy] = useState(false);
  const name = job.name || job.homeowner || job.customerName || job.title || "Untitled";

  const latestLine = useMemo(() => {
    const t = Array.isArray(job.timeline) ? job.timeline : [];
    const latest = t.length ? t[t.length - 1] : null;
    if (!latest) return recentDate(job.createdAt);
    const max = 50;
    const txt = String(latest.text || "");
    const preview = txt.length > max ? txt.slice(0, max - 1) + "…" : txt;
    return `${recentDate(latest.date || job.createdAt)} – ${preview}`;
  }, [job]);

  const toggleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, "jobs", job.id), { favorite: !!job.favorite ? false : true });
    } finally { setBusy(false); }
  };

  const deleteJob = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Delete job "${name}"? This cannot be undone.`)) return;
    if (busy) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, "jobs", job.id));
    } finally { setBusy(false); }
  };

  return (
    <Link to={`/jobs/${job.id}`} className="card" style={{ position: "relative" }}>
      <button
        className="favBtn" title={job.favorite ? "Unfavorite" : "Favorite"}
        onClick={toggleFavorite} aria-label="favorite toggle" disabled={busy}
      >
        {job.favorite ? "♥" : "♡"}
      </button>

      <button
        className="delBtn" title="Delete job"
        onClick={deleteJob} aria-label="delete job" disabled={busy}
      >
        ✕
      </button>

      <div className="cardInner">
        <strong>{name}</strong>
        <div className="jobType">{tradesText(job)}</div>
        <div className="latest">{latestLine}</div>
      </div>
    </Link>
  );
}
