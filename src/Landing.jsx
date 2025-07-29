import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="centerbox">
      <h1>Affordable Exteriors Job Tracker</h1>
      <Link to="/jobs" className="bigbtn">Continue ➜</Link>
    </div>
  );
}
