import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data
      );

      // ✅ LOGIN THROUGH CONTEXT
      login(res.data.user);

      navigate("/");
    } catch {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="auth-box">
      <h3>LOGIN</h3>

      <input
        placeholder="Username"
        value={data.username}
        onChange={e =>
          setData({ ...data, username: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={e =>
          setData({ ...data, password: e.target.value })
        }
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
