import React, { Component } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Change import from CSS to SCSS
import './Index.scss'
import DownloadButton from '../../Components/Buttons/DownloadButton'

type Props = {}

type State = {}

export default class Index extends Component<Props, State> {
  state = {}

  demiTeaserSnippet = `# My First Demi Program

const message = "Hello, Demi!";
print(message);`

  copyTeaserSnippet = async () => {
    try {
      await navigator.clipboard.writeText(this.demiTeaserSnippet)
    } catch {
      // ignore (clipboard may be unavailable depending on browser permissions)
    }
  }

  render() {
    return (
      <div className='container'>
        <h1>Demi</h1>
        <h2>Welcome To Demi</h2>
        <div className="dev-note">
          <p>
            <i className="fas fa-exclamation-triangle"></i>
            <strong> Demi is currently in development and not ready for production use.</strong>
            <br />
            <div className="update-note">
              <p>
                New profile feature is being worked on and will be available soon.
                This will allow you to create a profile and access the Demi community forum.
              </p>
            </div>
          </p>
        </div>
        <hr />
        <section className="intro-container">
          <h2>What is it?</h2>
          <p>
            Introducing Demi, an up and coming programming language designed to bring ideas from other languages and toolsets into one. With a focus on simplicity and performance,
            Demi offers a seamless coding experience for both beginners and seasoned programmers. It takes after Javascript syntactically with it's own little features baked in.
            Demi is being developed by Owen Boreham and is currently far from being ready for the public but there are big plans including bringing members of the community in to aide
            the development of this new language
          </p>
        </section>
        <hr className="hr-thick neon" />
        <div className="download-demo-wrapper">
          <section className="download-container">
            <h1>Download Demi Now!</h1>
            <div className="download-teaser">
              <div className="download-actions">
                <div className="idx-download-button">
                  <DownloadButton file="/downloads" download={false}>Download <i className="fas fa-download"></i></DownloadButton>
                  <p className="current-version"><i className="fas fa-tag"></i>{process.env.REACT_APP_CURRENT_DEMI_VERSION}</p>
                </div>
                <p>
                  Download the latest version of Demi above!
                </p>
              </div>
            </div>
          </section>

          <div className="demo-card" aria-label="Demi code example">
            <div className="demo-card-header">
              <div className="demo-card-title">
                <i className="fas fa-terminal"></i>
                <span>First program</span>
              </div>
              <button className="demo-card-copy" onClick={this.copyTeaserSnippet} type="button">
                Copy
              </button>
            </div>
            <div className="demo-card-code">
              <SyntaxHighlighter 
                language="javascript" 
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  borderRadius: '10px',
                  background: '#1e1e1e',
                  fontSize: '0.95em',
                  textAlign: 'left'
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                  }
                }}
              >
                {this.demiTeaserSnippet}
              </SyntaxHighlighter>
            </div>
            <div className="demo-card-hint">
              Run: <span className="demo-inline-code">demi first_program.dem</span>
            </div>
          </div>
        </div>
        <hr />
        <section className="description-container">
          <h1 className='underline'>Why Demi?</h1>
          <p>
          Demi, built on TypeScript and the Deno runtime, offers speed, security, and continual updates with new features.
          Its focus on safety without sacrificing performance makes it an ideal choice for developers seeking a modern and evolving platform.
          With regular enhancements, Demi provides a secure and efficient environment for coding. Additionally, its robust documentation and a growing
          community of contributors ensure a wealth of resources and support, making it easier for developers to adopt and implement Demi into their projects seamlessly.
          The platform's compatibility with various libraries and its supportive ecosystem further solidify its position as a versatile and forward-thinking programming language.
          </p>
        </section>
      </div>
    )
  }
}
