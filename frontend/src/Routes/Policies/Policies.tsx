import React from 'react';
import { Link } from 'react-router-dom';
import './Policies.scss';

export default function Policies() {
  const policies = [
    {
      title: 'Code of Conduct',
      icon: 'fa-handshake',
      description: 'Our commitment to fostering an open, welcoming, and inclusive community for all contributors and users.',
      link: '/policies/code-of-conduct',
      color: 'blue'
    },
    {
      title: 'Security Policy',
      icon: 'fa-shield-alt',
      description: 'Learn how to report security vulnerabilities and our commitment to keeping Demi secure.',
      link: '/policies/security',
      color: 'green'
    }
  ];

  return (
    <div className="policies-page">
      <div className="policies-hero">
        <div className="hero-icon">
          <i className="fas fa-file-contract"></i>
        </div>
        <h1>Policies & Guidelines</h1>
        <p className="hero-subtitle">
          Important information about using Demi and participating in our community
        </p>
      </div>

      <div className="policies-container">
        <div className="policies-intro">
          <p>
            We believe in transparency and clear communication. Below you'll find our policies 
            that govern how we operate, how we interact with our community, and how we handle 
            security concerns. Please take the time to read and understand these policies.
          </p>
        </div>

        <div className="policies-grid">
          {policies.map((policy, index) => (
            <Link to={policy.link} key={index} className={`policy-card ${policy.color}`}>
              <div className="policy-icon">
                <i className={`fas ${policy.icon}`}></i>
              </div>
              <h2>{policy.title}</h2>
              <p>{policy.description}</p>
              <span className="read-more">
                Read Policy <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          ))}
        </div>

        <div className="policies-footer">
          <div className="info-box">
            <i className="fas fa-info-circle"></i>
            <div className="info-content">
              <h3>Questions or Concerns?</h3>
              <p>
                If you have any questions about our policies or need clarification, 
                please don't hesitate to reach out to us.
              </p>
              <Link to="/contact" className="contact-btn">
                <i className="fas fa-envelope"></i>
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="last-updated">
          <i className="fas fa-clock"></i>
          <span>Last updated: January 2026</span>
        </div>
      </div>
    </div>
  );
}
