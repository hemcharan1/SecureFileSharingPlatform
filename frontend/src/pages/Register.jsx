import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Register.css";
import { toast } from "react-toastify";

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      await API.post("/register", {
        username,
        email,
        password
      });

      toast.success(
  "Registration Successful 🚀"
);

      navigate("/");

    } catch (error) {

      console.log(error);

      toast.error(
  "Registration Failed"
);

    }

  };

  return (

    <div className="register-container">

      <div className="register-card">

        <h1>Create Account</h1>

        <p>Join Secure File Sharing Platform</p>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />

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
            Register
          </button>

        </form>

        <span>
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </span>

      </div>

    </div>

  );

}

export default Register;