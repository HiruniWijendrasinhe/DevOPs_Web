import React from 'react';
import { useNavigate } from "react-router-dom";

import AZ from './Pictures/AZ.jpg';
import './Home.css';
function Home() {
const navigate=useNavigate();
const handleAdd = () => {
  const token = localStorage.getItem('token');
  if (token) {
    navigate("/incidents"); // Go to CreateIncident page if logged in
  } else {
    navigate("/login"); // Go to login if not logged in
  }
}
  return (

  <div className="HomeContainer">
  <div className="HomeQuote">
  <div className="HomeQuote">
  
   <p>Empowering teams to act fast, stay informed, and stay secure</p>
  </div>

  <button type ="button" onClick={handleAdd}>Get Started</button>



  </div>
  </div>


  );
}   export default Home;