import React from 'react';
import { Link } from 'react-router-dom';

import './Button.css'

type Props = {
    file: string
    children: any
    download?: boolean
}

export default function DownloadButton(props: Props) {
  if (props.download === false) return (
    <Link to={props.file}><button className="btn">{props.children}</button></Link>
  )
  else return (
    <Link to={props.file} target="_blank" download><button className="btn">{props.children}</button></Link>

  )
}