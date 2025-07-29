/* ============================================================================
   Directory.jsx
   Lists all jobs as Masonry cards + a floating “+” button.
============================================================================ */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection, query, orderBy, onSnapshot, deleteDoc, doc
} from "firebase/firestore";
import { db } from "./firebase";

const recentDate = iso => {
  const d = new Date(iso);
  return (Date.now()-d)<365*24*60*60*1000
    ? `${d.getMonth()+1}/${d.getDate()}`
    : d.toLocaleDateString();
};

export default function Directory() {

  //////////////////  State & realtime listener  //////////////////
  const [jobs, setJobs] = useState([]);
  useEffect(()=>onSnapshot(
    query(collection(db,"jobs"),orderBy("createdAt","desc")),
    snap=>setJobs(snap.docs.map(d=>({id:d.id,...d.data()})))
  ),[]);

  //////////////////////  Delete whole job  ///////////////////////
  const removeJob = async (e,id,name) => {
    e.preventDefault();   // stop <Link>
    if (confirm(`Delete entire job file for "${name}"?`))
      await deleteDoc(doc(db,"jobs",id));
  };

  ///////////////////////////  Render  ////////////////////////////
  return (
    <div className="wrapper">
      <h2 className="pageTitle">All Jobs</h2>

      <div className="masonry">
        {jobs.map(j=>{
          const latest=j.timeline?.[0];
          return (
            <Link key={j.id} to={`/jobs/${j.id}`} className="card">
              <button className="delBtn" onClick={e=>removeJob(e,j.id,j.name)}>✕</button>
              <strong>{j.name}</strong><br/>
              {j.projectType || j.address}<br/>
              <small>
                {latest ? `${recentDate(latest.date)} – ${latest.text.slice(0,35)}…`
                        : recentDate(j.createdAt)}
              </small>
            </Link>
          );
        })}
      </div>

      <Link to="/jobs/new" className="fab">＋</Link>
    </div>
  );
}
