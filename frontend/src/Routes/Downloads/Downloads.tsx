import React from 'react'
import './Downloads.css'
import DownloadButton from '../../Components/Buttons/DownloadButton'
import { Link } from 'react-router-dom'

type Props = {}

export default function Downloads(props: Props) {
  return (
    <div className="container">
      <h1>Download Demi <i className="fas fa-download"></i></h1>
      <h2>Download the latest version for Windows | Linux | MacOS </h2>
      <hr className='hr-thick'/>
      <div className="current-version-container"></div><p className='current-version-label'>Current Demi Version: </p><p className="current-version">{process.env.REACT_APP_CURRENT_DEMI_VERSION}</p>
      <a href="https://github.com/bobrossrtx/demi-lang" className="github-link"><i className="fa fa-github"></i></a>
      <br></br>
      <div className="download-container">
        <DownloadButton file={"/static/downloads/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"/demiscript-installer-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+".exe"}>Windows Installer<i className="fa fa-download"></i></DownloadButton>
        <DownloadButton file={"/static/downloads/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"/bin/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"_windows.rar"}>Windows <i className="fa fa-windows"></i></DownloadButton>
        <DownloadButton file={"/static/downloads/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"/bin/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"_linux.zip"}>Linux <i className="fa fa-linux"></i></DownloadButton>
        <DownloadButton file={"/static/downloads/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"/bin/demi-lang-"+process.env.REACT_APP_CURRENT_DEMI_VERSION+"_macos.zip"}>MacOS <i className="fa fa-apple"></i></DownloadButton>
      </div>
      <p>Disclaimer: The Windows installer may show an antivirus error as it doesn't yet have a valid signing key</p>
      <hr />
      <h2>Previous Versions</h2>
      <table className='release-table'>
      <tr>
        <th>Alpha</th>
        <th>Beta</th>
        <th>Release</th>
      </tr>
      <tr>
        <td>
          0.0.1-alpha
          <Link className='release-table-button release-table-button-first' to="/static/downloads/demi-lang-0.0.1-alpha/bin/demi-lang-0.0.1-alpha_windows.rar" target="_blank" download><i className="fa fa-windows"></i></Link>
          <Link className='release-table-button' to="/static/downloads/demi-lang-0.0.1-alpha/bin/demi-lang-0.0.1-alpha_linux.zip" target="_blank" download><i className="fa fa-linux"></i></Link>
          <Link className='release-table-button' to="/static/downloads/demi-lang-0.0.1-alpha/bin/demi-lang-0.0.1-alpha_macos.zip" target="_blank" download><i className="fa fa-apple"></i></Link>
        </td>
        <td>N/A</td>
        <td>N/A</td>
      </tr>
      <tr>
      <td>
          0.0.2-alpha
          <Link className='release-table-button release-table-button-first' to="/static/downloads/demi-lang-0.0.2-alpha/bin/demi-lang-0.0.2-alpha_windows.rar" target="_blank" download><i className="fa fa-windows"></i></Link>
          <Link className='release-table-button' to="/static/downloads/demi-lang-0.0.2-alpha/bin/demi-lang-0.0.2-alpha_linux.zip" target="_blank" download><i className="fa fa-linux"></i></Link>
          <Link className='release-table-button' to="/static/downloads/demi-lang-0.0.2-alpha/bin/demi-lang-0.0.2-alpha_macos.zip" target="_blank" download><i className="fa fa-apple"></i></Link>
        </td>
        <td>N/A</td>
        <td>N/A</td>
      </tr>
      <tr>
        <td>
          0.0.3-alpha
          <Link className='release-table-button release-table-button-first' to="/static/downloads/demi-lang-0.0.3-alpha/bin/demi-lang-0.0.3-alpha_windows.rar" target="_blank" download><i className="fa fa-windows"></i></Link>
          <Link className='release-table-button' to="/static/downloads/demi-lang-0.0.3-alpha/bin/demi-lang-0.0.3-alpha_linux.zip" target="_blank" download><i className="fa fa-linux"></i></Link>
          <Link className='release-table-button' to="/static/downloads/demi-lang-0.0.3-alpha/bin/demi-lang-0.0.3-alpha_macos.zip" target="_blank" download><i className="fa fa-apple"></i></Link>
        </td>
        <td>N/A</td>
        <td>N/A</td>
      </tr>
      </table>
    </div>
  )
}