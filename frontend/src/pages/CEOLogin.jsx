import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CEOLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);

      if (data.user.role === "ceo") {
        navigate("/ceo-dashboard");
      } else {
        alert("Only CEO can access this portal");
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="login-container">
      <h2>CEO Portal Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="CEO Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}