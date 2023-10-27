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
        <br />
        <h2>What is it?</h2>
        <p>
          Introducing Demi, an up and coming programming language designed to bring ideas from other languages and toolsets into one. With a focus on simplicity and performance,
          Demi offers a seamless coding experience for both beginners and seasoned programmers. It takes after Javascript syntactically with it's own little features baked in.
          Demi is being developed by Owen Boreham and is currently far from being ready for the public but there are big plans including bringing members of the community in to aide
          the development of this new language
        </p>
        <hr className="hr-thick" />
        <div className="download-container">
          <h1>Download Demi Now!</h1>
          <DownloadButton file="/downloads">Download <i className="fas fa-download"></i></DownloadButton>
          <p>
            Laborum anim magna nulla consequat in. Commodo non minim occaecat et reprehenderit et deserunt labore nisi nostrud cillum velit dolor ea. Velit laborum nulla sint Lorem eu.
            Exercitation aute aute Lorem irure. Magna tempor culpa aliqua ipsum id cillum pariatur esse ex aute eiusmod ad. Ullamco adipisicing id eiusmod et in laborum magna Lorem non.
            Lorem eiusmod incididunt fugiat magna incididunt consequat eu sint adipisicing cupidatat officia aliqua consectetur pariatur. Velit incididunt eiusmod consectetur ex dolor quis
            nostrud exercitation sit. Ut duis id velit sint aute id dolore. Pariatur occaecat labore officia ut cupidatat reprehenderit mollit laborum in anim sunt tempor.
          </p>
        </div>
      </div>
    )
  }
}