import React, { Component } from 'react'

import "./Footer.css"
import { Link } from 'react-router-dom'

type Props = {}

type State = {}

export default class Footer extends Component<Props, State> {
  state = {}

  render() {
    return (
      <footer>
        <div className="w-100 mw-none ph3 mw8-m mw9-l center f3">
          <div className="flex flex-col flex-row-ns pv0-1">
            <div className="flex flex-col mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l" id="get-help" data-np-autofill-form-type="other" data-np-checked="1" data-np-watching="1">
              <h4>Get help!</h4>
              <ul>
                <li><Link to="/docs">Documentation</Link></li>
                <li><Link to="/faq">Frequently Asked Questions</Link></li>
                <li><Link to="https://discord.gg/vvhkhGkuGF">Ask a Question on the Discord Forum</Link></li>
              </ul>
            </div>
            <div className="flex flex-col mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l" id="get-help" data-np-autofill-form-type="other" data-np-checked="1" data-np-watching="1">
              <h4>Terms & Policies</h4>
              <ul>
                <li><Link to="/policies/code-of-conduct">Code of Conduct</Link></li>
                {/* <li><Link to="/policies/code-of-conduct">Licenses</Link></li> */}
                <li><Link to="/policies/security">Security Notice</Link></li>
                <li><Link to="/policies">All Policies</Link></li>
              </ul>
            </div>
            <div className="flex flex-col mw8 w-100 measure-wide-l pv2 pv5-m pv2-ns ph4-m ph4-l" id="get-help" data-np-autofill-form-type="other" data-np-checked="1" data-np-watching="1">
              <h4>Social</h4>
              <div className="flex flex-row flex-wrap items-center footer-icons">
                {/* The Discord link */}
                <Link to="https://twitter.com/demiscript_off" target="_blank"><img src="/static/images/twitter.svg" alt="twitter logo" title="Twitter" /></Link>

                {/* Add when the youtube channel is made */}
                {/* <Link to="https://www.youtube.com/channel/UCaYhcUwRBNscFNUKTjgPFiA" target="_blank"><img className="pv2" src="/static/images/youtube.svg" alt="youtube logo" title="YouTube" /></Link> */}

                {/* The discord link */}
                <Link to="https://discord.gg/vvhkhGkuGF" target="_blank"><img src="/static/images/discord.svg" alt="discord logo" title="Discord" /></Link>

                {/* Change when migrated to the Demi github org */}
                <Link to="https://github.com/bobrossrtx/demi-lang" target="_blank"><img src="/static/images/github.svg" alt="github logo" title="GitHub" /></Link>
              </div>
            </div>
          </div>
          <div className="attribution">
            <p>Maintained by Owen Boreham. See a bug? <Link to="https://github.com/bobrossrtx/demi-website/issues/new/choose">File an issue!</Link></p>
            <p>©{new Date().getFullYear()} Demi Lang</p>
          </div>
        </div>
      </footer>
    )
  }
}