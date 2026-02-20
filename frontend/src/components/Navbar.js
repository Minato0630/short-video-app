import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div
        className="logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        ANIME SHORTS
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {user && <Link to="/upload">Upload</Link>}

        {user && (
          <Link to={`/user/${user.username}`}>
            Profile
          </Link>
        )}

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

        {user && (
          <span
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              cursor: "pointer",
              color: "#ff4d4d",
              marginLeft: "20px",
              fontWeight: "bold"
            }}
          >
            Logout
          </span>
        )}
      </div>
    </div>
  );
}
