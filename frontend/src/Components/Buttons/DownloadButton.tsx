import React from 'react';
import { Link } from 'react-router-dom';

import './Button.css'

type Props = {
    file: string
    children: any
}

export default function DownloadButton(props: Props) {


  return (
    <Link to={props.file} target="_blank" download><button className="btn">{props.children}</button></Link>
  )
}