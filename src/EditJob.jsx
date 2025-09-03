// src/EditJob.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { TRADE_OPTIONS } from "./constants";

export default function EditJob() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db,"jobs",id));
      if (snap.exists()) {
        const data = snap.data();
        const trades = Array.isArray(data.trades) ? data.trades : (data.projectType ? [String(data.projectType)] : []);
        setForm({ ...data, trades });
      } else {
        setForm({});
      }
    })();
  }, [id]);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const toggleTrade = (t) => {
    setForm(f => {
      const set = new Set(f.trades || []);
      if (set.has(t)) set.delete(t); else set.add(t);
      return { ...f, trades: Array.from(set) };
    });
  };

  const removeTrade = (t) => {
    setForm(f => ({ ...f, trades: (f.trades || []).filter(x => x !== t) }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    setErr("");
    if (!form) return;
    try {
      const payload = { ...form };
      payload.projectType = (form.trades && form.trades.length) ? form.trades.join(", ") : "";
      delete payload.createdAt; // avoid overwriting timestamp
      await updateDoc(doc(db,"jobs",id), payload);
      nav(`/jobs/${id}`);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to save changes");
    }
  };

  if (form === null) return <div className="centerbox">Loading…</div>;

  return (
    <div>
      <div className="pageHeader"><h1>Edit Job</h1></div>

      <form onSubmit={onSubmit} className="detailForm">
        <div className="twoCols">
          <label>
            Homeowner Name
            <input name="name" value={form.name||""} onChange={onChange} />
          </label>

          <label>
            Phone
            <input name="phone" value={form.phone||""} onChange={onChange} />
          </label>
        </div>

        <div className="twoCols">
          <label>
            Email
            <input name="email" value={form.email||""} onChange={onChange} />
          </label>

          <label>
            Start Date
            <input type="date" name="startDate" value={form.startDate||""} onChange={onChange}/>
          </label>
        </div>

        {/* Address */}
        <div className="twoCols">
          <label>
            Street
            <input name="street" value={form.street||""} onChange={onChange}/>
          </label>
          <label>
            City
            <input name="city" value={form.city||""} onChange={onChange}/>
          </label>
        </div>
        <div className="twoCols">
          <label>
            State
            <input name="state" value={form.state||""} onChange={onChange}/>
          </label>
          <label>
            ZIP
            <input name="zip" value={form.zip||""} onChange={onChange}/>
          </label>
        </div>

        {/* Trades */}
        <label>
          Trades
          <div className="tradeBank">
            {TRADE_OPTIONS.map(t => (
              <button
                type="button"
                key={t}
                className={"chip" + ((form.trades||[]).includes(t) ? " selected" : "")}
                onClick={() => toggleTrade(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </label>

        {form.trades && form.trades.length > 0 && (
          <div style={{ textAlign: "left", margin: "6px 0 12px" }}>
            {form.trades.map(t => (
              <span key={t} className="chip selected" onClick={() => removeTrade(t)}>
                {t} ✕
              </span>
            ))}
          </div>
        )}

        <button type="submit">Save Changes</button>
        {err && <p className="err">{err}</p>}
        <p><Link to={`/jobs/${id}`}>Cancel</Link></p>
      </form>
    </div>
  );
}
