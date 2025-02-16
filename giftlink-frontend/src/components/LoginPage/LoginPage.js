import React, { useState, useEffect } from "react";
import { urlConfig } from "../../config";
import { useAppContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [incorrect, setIncorrect] = useState("");

  const navigate = useNavigate();
  const { setIsLoggedIn } = useAppContext();
  const bearerToken = sessionStorage.getItem("bearer-token");

  useEffect(() => {
    if (sessionStorage.getItem("auth-token")) {
      navigate("/app");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Login failed");

      if (json.authtoken) {
        sessionStorage.setItem("auth-token", json.authtoken);
        sessionStorage.setItem("name", json.userName);
        sessionStorage.setItem("email", json.userEmail);
        setIsLoggedIn(true);
        navigate("/app");
      } else {
        setEmail("");
        setPassword("");
        setIncorrect("Wrong password. Try again.");
        setTimeout(() => setIncorrect(""), 2000);
      }
    } catch (error) {
      setIncorrect(error.message);
      setTimeout(() => setIncorrect(""), 3000);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="login-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIncorrect("");
                  }}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIncorrect("");
                  }}
                />
                {incorrect && (
                  <span
                    style={{
                      color: "red",
                      fontSize: "12px",
                      fontStyle: "italic",
                      display: "block",
                    }}
                  >
                    {incorrect}
                  </span>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Login
              </button>
            </form>
            <p className="mt-4 text-center">
              New here?{" "}
              <a href="/app/register" className="text-primary">
                Register Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
