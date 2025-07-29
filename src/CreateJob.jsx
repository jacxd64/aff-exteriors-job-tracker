import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const blank = {
  name: "", address: "", phone: "", email: "",
  startDate: "", projectType: "",             // unchanged fields
  timeline: []                                // NEW
};

export default function CreateJob() {
  const [form, setForm] = useState(blank);
  const [err,  setErr]  = useState("");
  const navigate = useNavigate();

  const onChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "jobs"), {
        ...form,
        createdAt: Date.now()
      });
      navigate(`/jobs/${docRef.id}`);
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="wrapper narrow">
      <Link to="/jobs" className="back">&larr; Cancel</Link>
      <h2>Create New Job</h2>

      <form onSubmit={submit} className="jobForm">
        {Object.keys(blank).filter(k=>k!=="timeline").map(k => (
          <label key={k}>
            {k.charAt(0).toUpperCase() + k.slice(1)}
            <input
              name={k}
              value={form[k]}
              onChange={onChange}
              required={k === "name"}
              type={k === "startDate" ? "date" : "text"}
            />
          </label>
        ))}
        <button type="submit">Save Job</button>
        {err && <p className="err">{err}</p>}
      </form>
    </div>
  );
}
