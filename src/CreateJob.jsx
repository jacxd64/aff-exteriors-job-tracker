import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

/* ---------------------------------------------------------------------------
   Blank template (split address fields)
--------------------------------------------------------------------------- */
const blank = {
  name: "",

  street: "", city: "", state: "", zip: "",   // NEW split address
  phone: "", email: "",

  startDate: "", projectType: "",
  timeline: []
};

export default function CreateJob() {
  const [form, setForm] = useState(blank);
  const [err,  setErr ] = useState("");
  const navigate = useNavigate();

  const onChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* -----------------------------------------------------------------------
     Submit: build fullAddress, keep legacy "address" field for old code
  ----------------------------------------------------------------------- */
  const submit = async e => {
    e.preventDefault();
    try {
      const fullAddress = `${form.street}, ${form.city}, ${form.state} ${form.zip}`;
      const docRef = await addDoc(collection(db, "jobs"), {
        ...form,
        address: fullAddress,   // legacy convenience
        fullAddress,            // explicit field if you need later
        createdAt: Date.now()
      });
      navigate(`/jobs/${docRef.id}`);
    } catch (ex) {
      setErr(ex.message);
    }
  };

  /* --------------------------------------------------------------------- */
  return (
    <div className="wrapper narrow">
      <Link to="/jobs" className="back">← Cancel</Link>
      <h2>Create New Job</h2>

      <form onSubmit={submit} className="jobForm">
        <label>
          Name
          <input name="name" value={form.name} onChange={onChange} required/>
        </label>

        {/* -------- address fields -------- */}
        <label>
          Street
          <input name="street" value={form.street} onChange={onChange} required/>
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={onChange} required/>
        </label>
        <label>
          State
          <input name="state" value={form.state} onChange={onChange} required/>
        </label>
        <label>
          Zip
          <input name="zip" value={form.zip} onChange={onChange} required/>
        </label>

        {/* -------- other fields -------- */}
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={onChange}/>
        </label>
        <label>
          Email
          <input name="email" value={form.email} onChange={onChange}/>
        </label>
        <label>
          Start Date
          <input type="date" name="startDate" value={form.startDate} onChange={onChange}/>
        </label>
        <label>
          Project Type
          <input name="projectType" value={form.projectType} onChange={onChange}/>
        </label>

        <button type="submit">Save Job</button>
        {err && <p className="err">{err}</p>}
      </form>
    </div>
  );
}
