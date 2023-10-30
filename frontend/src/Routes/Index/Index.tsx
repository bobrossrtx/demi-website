import React, { Component } from 'react'

import './Index.css'
import DownloadButton from '../../Components/Buttons/DownloadButton'

type Props = {}

type State = {}

export default class Index extends Component<Props, State> {
  state = {}

  render() {
    return (
      <div className='container'>
        <h1>Demi</h1>
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
        <section className="download-container">
          <h1>Download Demi Now!</h1>
          <div className="idx-download-button">
            <DownloadButton file="/downloads" download={false}>Download <i className="fas fa-download"></i></DownloadButton> <p className="current-version">{process.env.REACT_APP_CURRENT_DEMI_VERSION}</p>
          </div>
          <p>
            Download the latest version of Demi above!
          </p>
        </section>
        <hr />
        <section className="description-container">
          <h1 className='underline'>Why Demi?</h1>
          <p>
          Deno, built on TypeScript and the Deno runtime, offers speed, security, and continual updates with new features.
          Its focus on safety without sacrificing performance makes it an ideal choice for developers seeking a modern and evolving platform.
          With regular enhancements, Deno provides a secure and efficient environment for coding. Additionally, its robust documentation and a growing
          community of contributors ensure a wealth of resources and support, making it easier for developers to adopt and implement Deno into their projects seamlessly.
          The platform's compatibility with various libraries and its supportive ecosystem further solidify its position as a versatile and forward-thinking programming language.
          </p>
        </section>
      </div>
    )
  }
}