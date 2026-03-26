import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  const register = async () => {
    try {
      await axios.post(
`${API_URL}/api/auth/register`,
        data
      );

      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    register();
  };

  return (
    <form className="auth-box" onSubmit={handleSubmit}>
      <h3>REGISTER</h3>

      <label htmlFor="register-name">Full Name</label>
      <input
        id="register-name"
        name="name"
        placeholder="Full Name"
        value={data.name}
        onChange={e =>
          setData({ ...data, name: e.target.value })
        }
        autoComplete="name"
        required
      />

      <label htmlFor="register-username">Username</label>
      <input
        id="register-username"
        name="username"
        placeholder="Username"
        value={data.username}
        onChange={e =>
          setData({ ...data, username: e.target.value })
        }
        autoComplete="username"
        required
      />

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        name="email"
        placeholder="Email"
        type="email"
        value={data.email}
        onChange={e =>
          setData({ ...data, email: e.target.value })
        }
        autoComplete="email"
        required
      />

      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        name="password"
        type="password"
        placeholder="Password"
        value={data.password}
        onChange={e =>
          setData({ ...data, password: e.target.value })
        }
        autoComplete="new-password"
        required
      />

      <button type="submit">
        Register
      </button>
    </form>
  );
}
