/* ============================================================================
   JobDetail.jsx
   Shows details for a single job, with Timeline + Documents + Photos columns.
   Sections are delimited by  //////////////////////////////////////////////////
============================================================================ */

///////////////////////////////  Imports  ////////////////////////////////////
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc, onSnapshot, updateDoc, arrayUnion, arrayRemove
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL,
  deleteObject, ref as sRefFromURL
} from "firebase/storage";
import { db, storage } from "./firebase";

///////////////////////////////  Component  ///////////////////////////////////
export default function JobDetail() {

  /////////////////////////////  State  //////////////////////////////////////
  const { id } = useParams();
  const [job,   setJob]   = useState(null);

  // timeline form
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showTL, setShowTL] = useState(false);

  // file pickers
  const pdfInput   = useRef();
  const photoInput = useRef();

  // full-screen viewer
  const [viewer, setViewer] = useState({ open:false, kind:"doc", idx:0 });

  /////////////////////////  Live Firestore listener  /////////////////////////
  useEffect(() =>
    onSnapshot(doc(db, "jobs", id), snap =>
      setJob(snap.exists() ? snap.data() : null)
    ), [id]);

  /////////////////////////////  Helpers  /////////////////////////////////////

  /* ---- Timeline ---- */
  const addTL = async e => {
    e.preventDefault();
    if (!note.trim()) return;
    await updateDoc(doc(db,"jobs",id), {
      timeline: arrayUnion({ date, text:note.trim(), createdAt:Date.now() })
    });
    setNote(""); setShowTL(false);
  };

  /* ---- Uploads ---- */
  const uploadFiles = async (files, field, contentTypeCB) => {
    const entries = await Promise.all([...files].map(async f => {
      const path = `jobs/${id}/${field}/${Date.now()}_${f.name}`;
      const sRef = ref(storage, path);
      await uploadBytes(sRef, f, { contentType: contentTypeCB(f) });
      const url = await getDownloadURL(sRef);
      return { url, name:f.name, createdAt:Date.now() };
    }));
    await updateDoc(doc(db,"jobs",id), { [field]: arrayUnion(...entries) });
  };

  /* ---- Deletions ---- */
  const removeFile = async (field, item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try { await deleteObject(sRefFromURL(item.url)); } catch {}
    await updateDoc(doc(db,"jobs",id), { [field]: arrayRemove(item) });
  };

  const removeTL = async item => {
    if (!confirm("Delete this timeline note?")) return;
    await updateDoc(doc(db,"jobs",id), { timeline: arrayRemove(item) });
  };

  /* ---- Download helper (Save As) ---- */
  const downloadFile = async item => {
    const res  = await fetch(item.url);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), {
      href:url, download:item.name||"download"
    });
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); a.remove();
  };

  /////////////////////////////  Early returns  ///////////////////////////////
  if (job === null) return <p className="centerbox">Loading…</p>;
  if (!job)         return <p className="centerbox">Job not found.</p>;

  ////////////////////////////  Derived arrays  ///////////////////////////////
  const tl    = [...(job.timeline   || [])].sort((a,b)=>b.createdAt-a.createdAt);
  const docs  = [...(job.documents  || [])].sort((a,b)=>b.createdAt-a.createdAt);
  const pics  = [...(job.photos     || [])].sort((a,b)=>b.createdAt-a.createdAt);
  // ---- Address fallback (new vs old docs) ----
  const addressString = job.address || `${job.street}, ${job.city}, ${job.state} ${job.zip}`.replace(/^, | ,/g,"");

  ///////////////////////////  Viewer helpers  ////////////////////////////////
  const openViewer = (kind, idx) => setViewer({ open:true, kind, idx });
  const stepViewer = dir => setViewer(v=>{
    const len = v.kind==="doc" ? docs.length : pics.length;
    return { ...v, idx: (v.idx+dir+len)%len };
  });

  ///////////////////////////////  Render  ////////////////////////////////////
  return (
  <div className="wrapper">
    <Link to="/jobs" className="back">← All Jobs</Link>
    <h2>{job.name}</h2>

    {/* ---------- Meta fields ---------- */}
    <ul className="detailList narrow">
      <li><b>Address:</b> {addressString}</li>
      <li><b>Phone:</b>   {job.phone}</li>
      <li><b>Email:</b>   {job.email}</li>
      <li><b>Start Date:</b> {job.startDate}</li>
      <li><b>Project Type:</b> {job.projectType || "—"}</li>
    </ul>

    {/* ---------- 3 columns ---------- */}
    <div className="threeCols">

      {/* === Timeline column ================================================= */}
      <div className="col">
        <h3>Timeline
          <button className="toggleBtn" onClick={()=>setShowTL(s=>!s)}>
            {showTL ? "−" : "＋"}
          </button>
        </h3>

        {showTL && (
          <form onSubmit={addTL} className="timelineForm">
            <input   type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
                      placeholder="Add note…"/>
            <button>Add</button>
          </form>
        )}

        <ul className="timelineList">
          {tl.map((t,i)=>(
            <li key={i}>
              <button className="delBtn" onClick={()=>removeTL(t)}>✕</button>
              <span className="tDate">{t.date}</span>{t.text}
            </li>
          ))}
        </ul>
      </div>

      {/* === Documents column =============================================== */}
      <div className="col">
        <h3>Documents
          <button className="toggleBtn" onClick={()=>pdfInput.current.click()}>＋</button>
          <input ref={pdfInput} type="file" accept="application/pdf" multiple hidden
                 onChange={e=>{uploadFiles(e.target.files,"documents",()=>"application/pdf"); e.target.value="";}}/>
        </h3>

        <div className="docGrid">
          {docs.map((d,i)=>(
            <div key={i} className="docTile">
              <button className="delBtn" onClick={()=>removeFile("documents", d)}>✕</button>
              <button className="dlBtn"  onClick={e=>{e.stopPropagation(); downloadFile(d);}}>⬇</button>
              <button className="docBtn" onClick={()=>openViewer("doc", i)}>
                <span className="docIcon">📄</span>
                <span className="docName">
                  {d.name.length>18 ? d.name.slice(0,15)+"…" : d.name}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* === Photos column =================================================== */}
      <div className="col">
        <h3>Photos
          <button className="toggleBtn" onClick={()=>photoInput.current.click()}>＋</button>
          <input ref={photoInput} type="file" accept="image/*" multiple hidden
                 onChange={e=>{uploadFiles(e.target.files,"photos",f=>f.type||"image/jpeg"); e.target.value="";}}/>
        </h3>

        <div className="photoGrid">
          {pics.map((p,i)=>(
            <div key={i} className="photoTile">
              <button className="delBtn" onClick={()=>removeFile("photos", p)}>✕</button>
              <button className="dlBtn"  onClick={e=>{e.stopPropagation(); downloadFile(p);}}>⬇</button>
              <img src={p.url} alt="" className="photoImg" onClick={()=>openViewer("photo", i)}/>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ---------- Full-screen viewer ---------- */}
    {viewer.open && (
      <div className="viewer">
        <button className="vClose"      onClick={()=>setViewer({open:false,kind:"doc",idx:0})}>✕</button>
        <button className="vNav left"  onClick={()=>stepViewer(-1)}>‹</button>
        <button className="vNav right" onClick={()=>stepViewer(+1)}>›</button>

        {viewer.kind==="doc"
          ? <iframe title="doc" src={docs [viewer.idx].url} className="vFrame"/>
          : <img    alt=""      src={pics [viewer.idx].url} className="vImg"/>}

        <div className="vCaption">
          {viewer.kind==="doc" ? docs[viewer.idx].name : pics[viewer.idx].name }
        </div>
      </div>
    )}
  </div>
  );
}
