import React, { useState, useEffect } from 'react'
import './Downloads.scss'
import DownloadButton from '../../Components/Buttons/DownloadButton'
import { Link } from 'react-router-dom'

type Props = {}

export default function Downloads(props: Props) {
  const [detectedOS, setDetectedOS] = useState<string>('');
  const [copiedCommand, setCopiedCommand] = useState<string>('');
  const [expandedVersions, setExpandedVersions] = useState<boolean>(false);
  
  useEffect(() => {
    // Detect user's operating system
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (platform.includes('win') || userAgent.includes('windows')) {
      setDetectedOS('windows');
    } else if (platform.includes('mac') || userAgent.includes('mac')) {
      setDetectedOS('macos');
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      setDetectedOS('linux');
    }
  }, []);
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const downloadCards = [
    {
      id: 'windows-installer',
      os: 'windows',
      title: 'Windows Installer',
      icon: 'fa-download',
      recommended: true,
      description: 'Easy setup wizard for Windows',
      file: `/static/downloads/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}/demiscript-${process.env.REACT_APP_CURRENT_DEMI_VERSION}-installer.exe`,
      size: '~15 MB',
      requirements: 'Windows 10 or later'
    },
    {
      id: 'windows',
      os: 'windows',
      title: 'Windows',
      icon: 'fa-windows',
      description: 'Portable archive for Windows',
      file: `/static/downloads/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}/bin/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}_windows.rar`,
      size: '~12 MB',
      requirements: 'Windows 10 or later'
    },
    {
      id: 'linux',
      os: 'linux',
      title: 'Linux',
      icon: 'fa-linux',
      description: 'Universal Linux binary',
      file: `/static/downloads/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}/bin/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}_linux.zip`,
      size: '~10 MB',
      requirements: 'Linux kernel 4.0+',
      installCommand: 'curl -fsSL https://demi-website.fly.dev/install.sh | sh'
    },
    {
      id: 'macos',
      os: 'macos',
      title: 'macOS',
      icon: 'fa-apple',
      description: 'Universal binary for macOS',
      file: `/static/downloads/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}/bin/demi-lang-${process.env.REACT_APP_CURRENT_DEMI_VERSION}_macos.zip`,
      size: '~11 MB',
      requirements: 'macOS 10.15+',
      installCommand: 'brew install demi-lang'
    }
  ];
  
  return (
    <div className="container downloads-page">
      {/* Hero Section */}
      <div className="download-hero">
        <div className="hero-icon">
          <i className="fas fa-download"></i>
        </div>
        <h1>Download Demi</h1>
        <p className="hero-subtitle">Get started with the latest version of Demi</p>
        <div className="version-badge">
          <i className="fas fa-tag"></i>
          <span>Version {process.env.REACT_APP_CURRENT_DEMI_VERSION}</span>
        </div>
      </div>

      {/* Quick Install Section */}
      {(detectedOS === 'linux' || detectedOS === 'macos') && (
        <div className="quick-install-section">
          <h3><i className="fas fa-bolt"></i> Quick Install</h3>
          <p>Install Demi with a single command:</p>
          <div className="command-box">
            <code>{detectedOS === 'macos' ? 'brew install demi-lang' : 'curl -fsSL https://demi-lang.dev/install.sh | sh'}</code>
            <button 
              className={`copy-btn ${copiedCommand === 'quick' ? 'copied' : ''}`}
              onClick={() => copyToClipboard(detectedOS === 'macos' ? 'brew install demi-lang' : 'curl -fsSL https://demi-lang.dev/install.sh | sh', 'quick')}
            >
              <i className={`fas ${copiedCommand === 'quick' ? 'fa-check' : 'fa-copy'}`}></i>
              {copiedCommand === 'quick' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Download Cards */}
      <div className="download-cards-container">
        <h2>Choose Your Platform</h2>
        <div className="download-cards">
          {downloadCards.map((card) => (
            <div 
              key={card.id}
              className={`download-card ${detectedOS === card.os ? 'recommended' : ''}`}
            >
              {detectedOS === card.os && (
                <div className="recommended-badge">
                  <i className="fas fa-star"></i> Recommended for you
                </div>
              )}
              <div className="card-header">
                <i className={`fab ${card.icon} platform-icon`}></i>
                <h3>{card.title}</h3>
              </div>
              <p className="card-description">{card.description}</p>
              <div className="card-details">
                <div className="detail-item">
                  <i className="fas fa-hdd"></i>
                  <span>{card.size}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-laptop"></i>
                  <span>{card.requirements}</span>
                </div>
              </div>
              <DownloadButton file={card.file}>
                <i className="fas fa-download"></i> Download
              </DownloadButton>
              {card.installCommand && (
                <div className="install-command">
                  <span>or install via:</span>
                  <div className="command-inline">
                    <code>{card.installCommand}</code>
                    <button 
                      className="copy-icon-btn"
                      onClick={() => copyToClipboard(card.installCommand!, card.id)}
                      title="Copy command"
                    >
                      <i className={`fas ${copiedCommand === card.id ? 'fa-check' : 'fa-copy'}`}></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Installation Steps */}
      <div className="installation-guide">
        <h2><i className="fas fa-list-ol"></i> Installation Steps</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Download</h4>
            <p>Choose and download the appropriate version for your operating system above</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Extract</h4>
            <p>Extract the downloaded archive to your preferred location</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Add to PATH</h4>
            <p>Add the Demi binary directory to your system's PATH environment variable</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Verify</h4>
            <p>Run <code className="inline-code">demi --version</code> to verify installation</p>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="requirements-section">
        <h2><i className="fas fa-check-circle"></i> System Requirements</h2>
        <div className="requirements-grid">
          <div className="requirement-card">
            <i className="fab fa-windows"></i>
            <h4>Windows</h4>
            <ul>
              <li>Windows 10 or later</li>
              <li>64-bit processor</li>
              <li>4 GB RAM minimum</li>
              <li>100 MB disk space</li>
            </ul>
          </div>
          <div className="requirement-card">
            <i className="fab fa-linux"></i>
            <h4>Linux</h4>
            <ul>
              <li>Kernel 4.0 or later</li>
              <li>64-bit processor</li>
              <li>4 GB RAM minimum</li>
              <li>100 MB disk space</li>
            </ul>
          </div>
          <div className="requirement-card">
            <i className="fab fa-apple"></i>
            <h4>macOS</h4>
            <ul>
              <li>macOS 10.15 (Catalina) or later</li>
              <li>Intel or Apple Silicon</li>
              <li>4 GB RAM minimum</li>
              <li>100 MB disk space</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-box">
        <i className="fas fa-info-circle"></i>
        <p><strong>Note:</strong> The Windows installer may show a security warning as it doesn't yet have a valid code signing certificate. This is normal for open-source projects.</p>
      </div>

      {/* Previous Versions */}
      <div className="previous-versions-section">
        <div className="section-header">
          <h2><i className="fas fa-history"></i> Previous Versions</h2>
          <button 
            className="expand-btn"
            onClick={() => setExpandedVersions(!expandedVersions)}
          >
            <i className={`fas fa-chevron-${expandedVersions ? 'up' : 'down'}`}></i>
            {expandedVersions ? 'Hide' : 'Show'} Previous Versions
          </button>
        </div>
        
        {expandedVersions && (
          <div className="versions-table-container">
            <table className='versions-table'>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Release Type</th>
                  <th>Downloads</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="version-label">0.0.3-alpha</span>
                  </td>
                  <td>
                    <span className="badge badge-alpha">Alpha</span>
                  </td>
                  <td className="download-links">
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.3-alpha/bin/demi-lang-0.0.3-alpha_windows.rar" target="_blank" download title="Windows">
                      <i className="fab fa-windows"></i>
                    </Link>
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.3-alpha/bin/demi-lang-0.0.3-alpha_linux.zip" target="_blank" download title="Linux">
                      <i className="fab fa-linux"></i>
                    </Link>
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.3-alpha/bin/demi-lang-0.0.3-alpha_macos.zip" target="_blank" download title="macOS">
                      <i className="fab fa-apple"></i>
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="version-label">0.0.2-alpha</span>
                  </td>
                  <td>
                    <span className="badge badge-alpha">Alpha</span>
                  </td>
                  <td className="download-links">
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.2-alpha/bin/demi-lang-0.0.2-alpha_windows.rar" target="_blank" download title="Windows">
                      <i className="fab fa-windows"></i>
                    </Link>
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.2-alpha/bin/demi-lang-0.0.2-alpha_linux.zip" target="_blank" download title="Linux">
                      <i className="fab fa-linux"></i>
                    </Link>
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.2-alpha/bin/demi-lang-0.0.2-alpha_macos.zip" target="_blank" download title="macOS">
                      <i className="fab fa-apple"></i>
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="version-label">0.0.1-alpha</span>
                  </td>
                  <td>
                    <span className="badge badge-alpha">Alpha</span>
                  </td>
                  <td className="download-links">
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.1-alpha/bin/demi-lang-0.0.1-alpha_windows.rar" target="_blank" download title="Windows">
                      <i className="fab fa-windows"></i>
                    </Link>
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.1-alpha/bin/demi-lang-0.0.1-alpha_linux.zip" target="_blank" download title="Linux">
                      <i className="fab fa-linux"></i>
                    </Link>
                    <Link className='platform-link' to="/static/downloads/demi-lang-0.0.1-alpha/bin/demi-lang-0.0.1-alpha_macos.zip" target="_blank" download title="macOS">
                      <i className="fab fa-apple"></i>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3><i className="fas fa-question-circle"></i> Need Help?</h3>
        <p>Check out our <a href="/docs?page=getting-started/installation">installation guide</a> or <a href="/contact">contact us</a> if you run into any issues.</p>
      </div>
    </div>
  )
}