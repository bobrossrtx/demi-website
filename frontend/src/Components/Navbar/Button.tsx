import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

type Props = {
    to: string
    children: any
}

type State = {}

export default class Button extends Component<Props, State> {
  state = {}

  render() {
    return (
      <Link to={this.props.to}>
        <button className='btn'>{this.props.children}</button>
      </Link>
    )
  }
}