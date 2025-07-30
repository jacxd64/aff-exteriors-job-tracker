// src/Login.jsx
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const [err, setErr] = useState("");

  const handle = async () => {
    try   { await login(); }
    catch (ex){ setErr(ex.message); }
  };

  return (
    <div className="centerbox">
      <button className="bigbtn" onClick={handle}>Sign in with Google</button>
      {err && <p className="err">{err}</p>}
    </div>
  );
}
