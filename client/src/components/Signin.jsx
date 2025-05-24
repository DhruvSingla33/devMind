
import React, { Component, useState ,useEffect} from "react";
import { Link } from 'react-router-dom';
import './Signup.css'; // Import the CSS file
import sideimage from '../assets/sideimage.png';
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   const [autoLogin, setAutoLogin] = useState(false);
const [loading, setLoading] = useState(false);
     const navigate = useNavigate(); 

  function handleSubmit(e) {
    setLoading(true);
 if (e) e.preventDefault();
   
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    console.log(email, password);
    fetch(`${API_BASE_URL}/login-user`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userRegister");
        if (data.status == "ok") {
          alert("login successful");
          window.localStorage.setItem("token", data.data);
          window.localStorage.setItem("loggedIn", true);
          window.localStorage.setItem("email", email);
               window.location.href = "/";

        }
        else {
          alert("Invalid credentials");
        }
      })
      .catch((err) => {
        setLoading(false);
        alert("Something went wrong. Try again later.");
        console.error(err);
      });
  }
  useEffect(() => {
    if (autoLogin && email && password) {
      handleSubmit();
      setAutoLogin(false);
    }
  }, [email, password, autoLogin]);

const useSampleLogin = (role) => {
    if (role === "student") {
      setEmail("singladhruv24@gmail.com");
      setPassword("1234");
      setAutoLogin(true);
      
    } else if (role === "teacher") {
      setEmail("yogita@123gmail.com");
      setPassword("1234");
      setAutoLogin(true);
    }
  };

  return (
    <div className="auth-wrapper">
  <div className="auth-container">
    <div className="auth-left">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label>Email address</label>
        <input
          type="email"
          placeholder={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
        </button>
            <div className="sample-buttons">
              <button
                type="button"
                className="sample-login-btn student"
                onClick={() => useSampleLogin("student")}
                disabled={loading}
              >
                Student Sample Login
              </button>
             
            </div>

        <p style={{ marginTop: "15px" }}>
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </form>
    </div>
    <div className="auth-right">
      <img src={sideimage} alt="Side Visual" />
      <h3>Welcome Back to DevMinds</h3>
      <p>
        Collaborate, code, and grow together in a vibrant developer ecosystem.
      </p>
      <p style={{ marginTop: '1rem', color: '#00ffff', fontWeight: '500' }}>
     <strong>Note for Recruiters:</strong> You can skip sign-up and directly log in using the <em>sample account</em>.
      </p>
    </div>
  </div>
</div>

  );
}
