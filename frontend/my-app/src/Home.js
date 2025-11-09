import React from 'react';
import { useNavigate } from "react-router-dom";

import AZ from './Pictures/AZ.jpg';
import './Home.css';
function Home() {
const navigate=useNavigate();
const handleAdd = () => {

    navigate("/login");}
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