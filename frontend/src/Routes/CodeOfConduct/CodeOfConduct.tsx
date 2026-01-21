import React from 'react';
import './CodeOfConduct.scss';

export default function CodeOfConduct() {
  return (
    <div className="code-of-conduct-page">
      <div className="coc-hero">
        <div className="hero-icon">
          <i className="fas fa-handshake"></i>
        </div>
        <h1>Code of Conduct</h1>
        <p className="hero-subtitle">
          Our commitment to fostering an open and welcoming environment
        </p>
      </div>

      <div className="coc-container">
        <section className="coc-section">
          <h2><i className="fas fa-heart"></i> Our Pledge</h2>
          <p>
            In the interest of fostering an open and welcoming environment, we as contributors and maintainers 
            pledge to make participation in our project and our community a harassment-free experience for everyone, 
            regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, 
            level of experience, education, socio-economic status, nationality, personal appearance, race, religion, 
            or sexual identity and orientation.
          </p>
        </section>

        <section className="coc-section">
          <h2><i className="fas fa-star"></i> Our Standards</h2>
          <div className="standards-grid">
            <div className="standard-card positive">
              <h3><i className="fas fa-check-circle"></i> Examples of Positive Behavior</h3>
              <ul>
                <li>Using welcoming and inclusive language</li>
                <li>Being respectful of differing viewpoints and experiences</li>
                <li>Gracefully accepting constructive criticism</li>
                <li>Focusing on what is best for the community</li>
                <li>Showing empathy towards other community members</li>
                <li>Providing helpful and constructive feedback</li>
              </ul>
            </div>
            <div className="standard-card negative">
              <h3><i className="fas fa-times-circle"></i> Unacceptable Behavior</h3>
              <ul>
                <li>The use of sexualized language or imagery</li>
                <li>Trolling, insulting/derogatory comments, and personal attacks</li>
                <li>Public or private harassment</li>
                <li>Publishing others' private information without permission</li>
                <li>Other conduct which could reasonably be considered inappropriate</li>
                <li>Advocating for, or encouraging, any unacceptable behavior</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="coc-section">
          <h2><i className="fas fa-gavel"></i> Enforcement Responsibilities</h2>
          <p>
            Project maintainers are responsible for clarifying and enforcing our standards of acceptable behavior 
            and will take appropriate and fair corrective action in response to any behavior that they deem 
            inappropriate, threatening, offensive, or harmful.
          </p>
          <p>
            Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, 
            code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and 
            will communicate reasons for moderation decisions when appropriate.
          </p>
        </section>

        <section className="coc-section">
          <h2><i className="fas fa-globe"></i> Scope</h2>
          <p>
            This Code of Conduct applies within all project spaces, and it also applies when an individual is 
            representing the project or its community in public spaces. Examples of representing our project or 
            community include using an official project e-mail address, posting via an official social media account, 
            or acting as an appointed representative at an online or offline event.
          </p>
        </section>

        <section className="coc-section">
          <h2><i className="fas fa-exclamation-triangle"></i> Reporting</h2>
          <div className="reporting-box">
            <p>
              Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project 
              team responsible for enforcement. All complaints will be reviewed and investigated promptly and fairly.
            </p>
            <p>
              All project team members are obligated to respect the privacy and security of the reporter of any incident.
            </p>
            <a href="/contact" className="report-btn">
              <i className="fas fa-flag"></i>
              Report an Incident
            </a>
          </div>
        </section>

        <section className="coc-section">
          <h2><i className="fas fa-balance-scale"></i> Enforcement Guidelines</h2>
          <div className="enforcement-levels">
            <div className="level-card">
              <div className="level-number">1</div>
              <h3>Correction</h3>
              <p><strong>Impact:</strong> Use of inappropriate language or other behavior deemed unprofessional.</p>
              <p><strong>Consequence:</strong> A private, written warning, providing clarity around the nature of 
              the violation and an explanation of why the behavior was inappropriate.</p>
            </div>
            <div className="level-card">
              <div className="level-number">2</div>
              <h3>Warning</h3>
              <p><strong>Impact:</strong> A violation through a single incident or series of actions.</p>
              <p><strong>Consequence:</strong> A warning with consequences for continued behavior. No interaction 
              with the people involved for a specified period of time.</p>
            </div>
            <div className="level-card">
              <div className="level-number">3</div>
              <h3>Temporary Ban</h3>
              <p><strong>Impact:</strong> A serious violation of community standards, including sustained inappropriate behavior.</p>
              <p><strong>Consequence:</strong> A temporary ban from any sort of interaction or public communication 
              with the community for a specified period of time.</p>
            </div>
            <div className="level-card">
              <div className="level-number">4</div>
              <h3>Permanent Ban</h3>
              <p><strong>Impact:</strong> Demonstrating a pattern of violation of community standards.</p>
              <p><strong>Consequence:</strong> A permanent ban from any sort of public interaction within the community.</p>
            </div>
          </div>
        </section>

        <section className="coc-section attribution">
          <h2><i className="fas fa-info-circle"></i> Attribution</h2>
          <p>
            This Code of Conduct is adapted from the <a href="https://www.contributor-covenant.org/" target="_blank" rel="noopener noreferrer">Contributor Covenant</a>, 
            version 2.1, available at <a href="https://www.contributor-covenant.org/version/2/1/code_of_conduct.html" target="_blank" rel="noopener noreferrer">
            https://www.contributor-covenant.org/version/2/1/code_of_conduct.html</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
