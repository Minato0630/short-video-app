import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../utils/api";

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
`${API_URL}/api/auth/login`,
        data
      );

      // ✅ LOGIN THROUGH CONTEXT
      login(res.data.user);

      navigate("/");
    } catch {
      alert("Invalid username or password");
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <form className="auth-box" onSubmit={handleSubmit}>
      <h3>LOGIN</h3>

      <label htmlFor="login-username">Username</label>
      <input
        id="login-username"
        name="username"
        placeholder="Username"
        value={data.username}
        onChange={e =>
          setData({ ...data, username: e.target.value })
        }
        autoComplete="username"
        required
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        name="password"
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={e =>
          setData({ ...data, password: e.target.value })
        }
        autoComplete="current-password"
        required
      />

      <button type="submit">
        Login
      </button>
    </form>
  );
}
