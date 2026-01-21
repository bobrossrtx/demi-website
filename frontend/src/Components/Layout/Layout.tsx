import React, { Component } from 'react'
import { useLocation } from 'react-router-dom';

// Global layout Components
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

type Props = {
    children: any
}

type State = {}

// ScrollToTop component to handle scroll on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default class Layout extends Component<Props, State> {
  state = {}

  render() {
    return (
      <>
        <ScrollToTop />
        <Navbar />
        <main>{this.props.children}</main>
        <Footer />
      </>
    )
  }
}