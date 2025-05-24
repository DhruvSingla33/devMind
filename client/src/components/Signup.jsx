import React, { Component, useState } from "react";
import './Signup.css'; // Import the CSS file
import { Link } from 'react-router-dom';
import sideimage from '../assets/sideimage.png';
export default function SignUp() {
  const [Firstname, setFname] = useState("");
  const [Lastname, setLname] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [UserType, setUserType] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const handleSubmit = (e) => {
    if (UserType == "Admin" && secretKey != "Admin@123") {
      e.preventDefault();
      alert("Invalid Admin");
    }
     else {
      e.preventDefault();

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          Firstname,
          Email,
          Lastname,
          Password,
          UserType,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "userRegister");
          if (data.status == "ok") {
            alert("Registration Successful");
          } else {
            alert("Something went wrong");
          }
        });
    }
  };

  return (
  
  
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <label>Register As:</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              {["User", "Admin"].map((type) => (
                <label
                  key={type}
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem" }}
                >
                  <input
                    type="radio"
                    name="UserType"
                    value={type}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  {type}
                </label>
              ))}
            </div>

            {(UserType === "Admin" ) && (
              <>
                <label>Secret Key</label>
                
                <input
                  type="password"
                  placeholder="Secret Key"
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </>
            )}

            <label>First Name</label>
            <input
              type="text"
              placeholder="First name"
              onChange={(e) => setFname(e.target.value)}
            />

            <label>Last Name</label>
            <input
              type="text"
              placeholder="Last name"
              onChange={(e) => setLname(e.target.value)}
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Sign Up</button>

            <p style={{ marginTop: "15px" }}>
              Already registered? <Link to="/signin">Sign In</Link>
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
