import React, { useState } from "react";
import axios from "axios";
import Hub from "./Hub";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("userEmail", email);//Only change I have done in this file
        setFormData(response.data.user); // Set the user data
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError("Failed to login. Please try again.");
    }
  };

  // If formData is set, navigate to the Hub page
  if (formData) {
    return <Hub formData={formData} />;
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-login">
          Login
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
