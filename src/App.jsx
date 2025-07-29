import { useState, useEffect } from "react";
import "./App.css";

import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, orderBy
} from "firebase/firestore";
import { db } from "./firebase";          // your config lives here

/* ---- helpers ---- */
const blankJob = { name:"", address:"", phone:"", email:"", startDate:"" };

export default function App() {
  /* ---------- state ---------- */
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(blankJob);

  /* ---------- live Firestore listener ---------- */
  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt"));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(list);
    });
    return unsub; // clean up when component unmounts
  }, []);

  /* ---------- handlers ---------- */
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addJob = async e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addDoc(collection(db, "jobs"), {
      ...form,
      createdAt: Date.now()
    });
    setForm(blankJob);
  };

  const deleteJob = id => deleteDoc(doc(db, "jobs", id));

  /* ---------- ui ---------- */
  return (
    <div className="wrapper">
      <h1>Job Tracker (Cloud Sync)</h1>

      {/* ---- add job form ---- */}
      <form onSubmit={addJob} className="card">
        {Object.keys(blankJob).map(field => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
            required={field === "name"}
          />
        ))}
        <button type="submit">Add Job</button>
      </form>

      {/* ---- job table ---- */}
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Address</th><th>Phone</th>
            <th>Email</th><th>Start Date</th><th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(j => (
            <tr key={j.id}>
              <td>{j.name}</td><td>{j.address}</td><td>{j.phone}</td>
              <td>{j.email}</td><td>{j.startDate}</td>
              <td>
                <button onClick={() => deleteJob(j.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
