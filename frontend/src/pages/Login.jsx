import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Login.css";
import { toast } from "react-toastify";
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await API.post(
        "/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      toast.success(
  "Login Successful 🚀"
);

      navigate("/dashboard");
    } catch (error) {
      toast.error(
  "Invalid Credentials"
);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Secure File Sharing</h1>

        <p>Welcome Back</p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <span>
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </span>

      </div>
    </div>
  );
}

export default Login;