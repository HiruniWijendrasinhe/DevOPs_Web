import React, { useState } from 'react';
import './ContactUs.css';


function ContactUs() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Send us your message or inquiry below. We value your feedback!</p>
      <div className="contact-content">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>Message</label>
          <textarea
            name="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={5}
            placeholder="Type your message here..."
          />
          <button type="submit">Send</button>
          {submitted && <div className="contact-success">Thank you! Your message has been received (no email sent).</div>}
        </form>
        <div className="contact-info contact-info-black">
         
          <p><strong>Email:</strong> support@Alterfy.com</p>
          <p><strong>Phone:</strong> +94 11 234 5678</p>
          <p><strong>Address:</strong> 456 Galle Road,<br /> <br /> Colombo, Sri Lanka</p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;