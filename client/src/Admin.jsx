
import React, { Component, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
const Admin= () => {
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
      fetch("http://localhost:8000/userdata", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          token: window.localStorage.getItem("token"),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          
          if (data.data.UserType == "Admin") {
            setAdmin(true);
          }
         else{
          window.location.href = "./signin";
         }
          
  
         
        });
    }, []);
  return (
    <>
    <Link to="/addpost" className="text-2xl"> <button className="btn btn-accent w-2/12">+Add Post</button></Link>
    <Link to="/addproblem" className="text-2xl"> <button className="btn btn-accent w-2/12">+Add Problem</button></Link>
    <h1> your admin</h1>
    </>
  )
}

export default Admin;