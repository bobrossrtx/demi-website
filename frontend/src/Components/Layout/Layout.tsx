import React, { Component } from 'react'

// Global layout Components
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

type Props = {
    children: any
}

type State = {}

export default class Layout extends Component<Props, State> {
  state = {}

  render() {
    return (
      <>
        <Navbar />
        <main>{this.props.children}</main>
        <Footer />
      </>
    )
  }
}