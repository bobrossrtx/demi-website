import React, { useState } from 'react'
import emailjs from 'emailjs-com'
import Notification from '../../Components/Notification/Notification'
import './Contact.scss'

type Props = {}

export default function Contact({ }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID!,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
      formData,
      process.env.REACT_APP_EMAILJS_USER_ID!
    ).then((result) => {
      console.log(result.text);
      window.location.href = '/contact/sent?success=true';
    }, (error) => {
      console.log(error.text);
      setIsSubmitting(false);
      window.location.href = '/contact/sent?success=false';
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="hero-icon">
          <i className="fas fa-envelope"></i>
        </div>
        <h1>Get In Touch</h1>
        <p className="hero-subtitle">Have questions or feedback? We'd love to hear from you!</p>
      </div>

      <Notification
        id="contact-out-of-service"
        type="warning"
        title="Contact Form Temporarily Unavailable"
        message="The contact form is currently out of service due to mail provider issues. Please check back later or reach out via our community channels in the meantime."
        persistent={false}
      />

      <div className="contact-container">
        <div className="contact-info">
          <h2><i className="fas fa-info-circle"></i> Let's Connect</h2>
          <p>
            Whether you have a question about features, need technical support, 
            or want to collaborate on the Demi project, our team is ready to help.
          </p>
          
          <div className="info-cards">
            <div className="info-card">
              <i className="fas fa-clock"></i>
              <h3>Response Time</h3>
              <p>We typically respond within 24-48 hours</p>
            </div>
            <div className="info-card">
              <i className="fab fa-github"></i>
              <h3>Open Source</h3>
              <p>Check out our GitHub for issues and contributions</p>
            </div>
            <div className="info-card">
              <i className="fas fa-users"></i>
              <h3>Community</h3>
              <p>Join our growing community of developers</p>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i> Name
              </label>
              <input 
                type="text" 
                id="name"
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your name"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Email
              </label>
              <input 
                type="email" 
                id="email"
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="your.email@example.com"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">
                <i className="fas fa-comment-alt"></i> Message
              </label>
              <textarea 
                id="message"
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Tell us what's on your mind..."
                rows={6}
                required 
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}