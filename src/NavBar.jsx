// src/NavBar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./App.css";                    // reuse your global styles

export default function NavBar() {
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/jobs">Home</Link>
      <Link to="/favorites">Favorites</Link>
      <Link to="/calendar">Calendar</Link>
      <Link to="/search">Search</Link>
      <Link to="/templates">Templates</Link>
      <button className="navLogout" onClick={logout}>Log out</button>
    </nav>
  );
}
