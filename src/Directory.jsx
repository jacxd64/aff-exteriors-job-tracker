import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection, query, orderBy, onSnapshot, deleteDoc, doc
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthProvider";

const recentDate = iso => {
  const d=new Date(iso);
  return (Date.now()-d)<365*24*60*60*1000
    ? `${d.getMonth()+1}/${d.getDate()}`
    : d.toLocaleDateString();
};

export default function Directory() {
  const [jobs,setJobs]=useState([]);
  const { logout } = useAuth();

  useEffect(()=>onSnapshot(
    query(collection(db,"jobs"),orderBy("createdAt","desc")),
    snap=>setJobs(snap.docs.map(d=>({id:d.id,...d.data()})))
  ),[]);

  const removeJob = async (e,id,name) => {
    e.preventDefault();
    if (confirm(`Delete entire job file for "${name}"?`))
      await deleteDoc(doc(db,"jobs",id));
  };

  return (
    <div className="wrapper">
      <h2 className="pageTitle">
        All Jobs
        <button onClick={logout} style={{marginLeft:8}}>Log out</button>
      </h2>

      <div className="masonry">
        {jobs.map(j=>{
          const latest = j.timeline?.[0];
          const addr   = j.address || `${j.street}, ${j.city}`;
          return (
            <Link key={j.id} to={`/jobs/${j.id}`} className="card">
              {/* delete-file ✕ in the corner */}
              <button
                className="delBtn"
                onClick={e => removeJob(e, j.id, j.name)}
              >
                ✕
              </button>

              <strong>{j.name}</strong><br />

              <span className="jobType">
                {j.projectType || addr}
              </span><br />

              <span className="latest">
                {latest
                  ? (() => {
                    const max = 50;
                    const text = latest.text;
                    const preview =
                      text.length > max ? text.slice(0, max - 1) + "…" : text;
                    return `${recentDate(latest.date)} – ${preview}`;
                  })()
                  : recentDate(j.createdAt)}

              </span>
            </Link>
          );
        })}
      </div>

      <Link to="/jobs/new" className="fab">＋</Link>
    </div>
  );
}
