// src/AuthProvider.jsx
//////////////////////////////////////////////////////////////////////////////
//  AuthProvider — supplies { user, login, logout } to the whole app
//////////////////////////////////////////////////////////////////////////////
import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth, onAuthStateChanged, signInWithPopup,
  GoogleAuthProvider, signOut
} from "firebase/auth";
import { app } from "./firebase";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const auth = getAuth(app);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
    onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }),
  []);

  const login  = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  return (
    <Ctx.Provider value={{ user, login, logout }}>
      {!loading && children}
    </Ctx.Provider>
  );
}
