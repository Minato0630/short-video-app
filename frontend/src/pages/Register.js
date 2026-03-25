import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="auth-box">
      <h3>REGISTER</h3>

      <input
        placeholder="Full Name"
        value={data.name}
        onChange={e =>
          setData({ ...data, name: e.target.value })
        }
      />

      <input
        placeholder="Username"
        value={data.username}
        onChange={e =>
          setData({ ...data, username: e.target.value })
        }
      />

      <input
        placeholder="Email"
        type="email"
        value={data.email}
        onChange={e =>
          setData({ ...data, email: e.target.value })
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

      <button onClick={register}>
        Register
      </button>
    </div>
  );
}
