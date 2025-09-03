import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import JobCard from "./components/JobCard";

export default function Favorites() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const favs = useMemo(() => jobs.filter((j) => !!j.favorite), [jobs]);

  return (
    <div>
      <div className="pageHeader">
        <h1>Favorites</h1>
        {favs.length > 0 && <div className="muted">{favs.length} job{favs.length === 1 ? "" : "s"}</div>}
      </div>

      <div className="masonry">
        {favs.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
        {favs.length === 0 && (
          <div className="centerbox" style={{ marginTop: 24 }}>
            No favorites yet. Tap the ♡ on any card to add one.
          </div>
        )}
      </div>
    </div>
  );
}
