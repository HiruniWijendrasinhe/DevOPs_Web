import React from "react";
import twitter_new from "./Pictures/twitter_new.png";
import linkdin_new from "./Pictures/linkdin_new.png";
import facebook_new from "./Pictures/facebook_new.png";
import instagram from "./Pictures/instagram.png";
import './Footer.css';
function Footer() {
  return (
    <footer>
    <div className="site-footer">
    <div className="footer-vertical">
      <div className="footer-horizontal">
      
      
      <p>Home</p>
      <p>Report</p>
      <p>Progress</p>
      <p>ContactUs</p>
      </div>
      <div className="footer-horizontal">
      
      <img src={twitter_new} alt="icon"/>
      <img src={linkdin_new} alt="icon"/>
      <img src={facebook_new} alt="icon"/>
        <img src={instagram} alt="icon"/>
     </div>
      <p>© 2025 Alertify Inc. All rights reserved.</p>
     </div>
      </div>
    </footer>
  );
}

export default Footer;