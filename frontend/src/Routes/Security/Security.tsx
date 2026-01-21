import React from 'react';
import './Security.scss';

export default function Security() {
  return (
    <div className="security-page">
      <div className="security-hero">
        <div className="hero-icon">
          <i className="fas fa-shield-alt"></i>
        </div>
        <h1>Security Policy</h1>
        <p className="hero-subtitle">
          Keeping Demi secure is a top priority
        </p>
      </div>

      <div className="security-container">
        <section className="security-section">
          <h2><i className="fas fa-info-circle"></i> Overview</h2>
          <p>
            The Demi team takes security seriously. We appreciate your efforts to responsibly disclose your 
            findings and will make every effort to acknowledge your contributions.
          </p>
        </section>

        <section className="security-section supported-versions">
          <h2><i className="fas fa-code-branch"></i> Supported Versions</h2>
          <p>
            Currently, Demi is in early alpha development. While we're actively working on security, 
            please note that alpha versions are not recommended for production use.
          </p>
          <div className="versions-table">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Supported</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0.0.3-alpha</td>
                  <td><span className="badge supported"><i className="fas fa-check"></i> Yes</span></td>
                  <td>Latest Development Release</td>
                </tr>
                <tr>
                  <td>0.0.2-alpha</td>
                  <td><span className="badge partial"><i className="fas fa-exclamation-triangle"></i> Partial</span></td>
                  <td>Critical fixes only</td>
                </tr>
                <tr>
                  <td>0.0.1-alpha</td>
                  <td><span className="badge unsupported"><i className="fas fa-times"></i> No</span></td>
                  <td>No longer supported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="security-section">
          <h2><i className="fas fa-bug"></i> Reporting a Vulnerability</h2>
          <div className="reporting-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Identify the Issue</h3>
              <p>
                If you discover a security vulnerability in Demi, first ensure it's reproducible 
                and document the steps to reproduce it.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Contact Us Privately</h3>
              <p>
                Do NOT open a public GitHub issue. Instead, contact us through the secure channels 
                listed below to report the vulnerability privately.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Provide Details</h3>
              <p>
                Include as much information as possible: affected versions, reproduction steps, 
                potential impact, and any suggested fixes.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Wait for Response</h3>
              <p>
                We aim to acknowledge reports within 48 hours and will keep you updated on the 
                status of your report.
              </p>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h2><i className="fas fa-envelope"></i> Contact Information</h2>
          <div className="contact-methods">
            <div className="contact-card">
              <i className="fas fa-at"></i>
              <h3>Email</h3>
              <p>For security issues, please contact us via our contact form</p>
              <a href="/contact" className="contact-link">
                Contact Form <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className="contact-card">
              <i className="fab fa-github"></i>
              <h3>GitHub</h3>
              <p>For non-security issues, open a GitHub issue</p>
              <a href="https://github.com/bobrossrtx/demi-lang/issues" target="_blank" rel="noopener noreferrer" className="contact-link">
                GitHub Issues <i className="fas fa-external-link-alt"></i>
              </a>
            </div>
          </div>
        </section>

        <section className="security-section">
          <h2><i className="fas fa-clipboard-check"></i> Our Commitment</h2>
          <div className="commitment-grid">
            <div className="commitment-item">
              <i className="fas fa-clock"></i>
              <h3>Timely Response</h3>
              <p>We aim to acknowledge all reports within 48 hours</p>
            </div>
            <div className="commitment-item">
              <i className="fas fa-user-shield"></i>
              <h3>Confidentiality</h3>
              <p>Your report will be kept confidential during investigation</p>
            </div>
            <div className="commitment-item">
              <i className="fas fa-sync-alt"></i>
              <h3>Regular Updates</h3>
              <p>We'll keep you informed of progress and resolution</p>
            </div>
            <div className="commitment-item">
              <i className="fas fa-award"></i>
              <h3>Recognition</h3>
              <p>We credit researchers who responsibly disclose vulnerabilities</p>
            </div>
          </div>
        </section>

        <section className="security-section scope">
          <h2><i className="fas fa-crosshairs"></i> Scope</h2>
          <div className="scope-columns">
            <div className="scope-column in-scope">
              <h3><i className="fas fa-check-circle"></i> In Scope</h3>
              <ul>
                <li>Demi language interpreter/compiler</li>
                <li>Standard library vulnerabilities</li>
                <li>Official documentation website</li>
                <li>Build tools and package manager (when available)</li>
                <li>Memory safety issues</li>
                <li>Code injection vulnerabilities</li>
              </ul>
            </div>
            <div className="scope-column out-of-scope">
              <h3><i className="fas fa-times-circle"></i> Out of Scope</h3>
              <ul>
                <li>Third-party dependencies (report to respective projects)</li>
                <li>Social engineering attacks</li>
                <li>Denial of service in alpha versions</li>
                <li>Issues in unsupported versions</li>
                <li>Theoretical vulnerabilities without proof of concept</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="security-section best-practices">
          <h2><i className="fas fa-lightbulb"></i> Security Best Practices</h2>
          <div className="practices-list">
            <div className="practice-card">
              <i className="fas fa-download"></i>
              <h3>Download from Official Sources</h3>
              <p>Always download Demi from our official website or GitHub releases. Verify checksums when available.</p>
            </div>
            <div className="practice-card">
              <i className="fas fa-sync"></i>
              <h3>Keep Updated</h3>
              <p>Always use the latest supported version to benefit from security patches and improvements.</p>
            </div>
            <div className="practice-card">
              <i className="fas fa-file-code"></i>
              <h3>Review Code</h3>
              <p>Review any third-party Demi code before running it, especially during the alpha phase.</p>
            </div>
            <div className="practice-card">
              <i className="fas fa-lock"></i>
              <h3>Sandbox Testing</h3>
              <p>Test alpha versions in isolated environments, not on production systems.</p>
            </div>
          </div>
        </section>

        <section className="security-section disclosure-policy">
          <h2><i className="fas fa-eye"></i> Disclosure Policy</h2>
          <p>
            When we receive a security report, we will:
          </p>
          <ol className="disclosure-steps">
            <li>Confirm the receipt of your report within 48 hours</li>
            <li>Provide an initial assessment within 1 week</li>
            <li>Work on a fix and keep you informed of progress</li>
            <li>Coordinate with you on the disclosure timeline</li>
            <li>Credit you in the security advisory (if desired)</li>
            <li>Publicly disclose the issue after a fix is released</li>
          </ol>
        </section>

        <div className="security-footer">
          <i className="fas fa-heart"></i>
          <p>
            Thank you for helping keep Demi and its users safe!
          </p>
        </div>
      </div>
    </div>
  );
}
