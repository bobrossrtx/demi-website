import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

type MenuItem = {
  title: string;
  path: string;
  cName: string
}

type Props = {
  menuItems: Array<MenuItem>
}

const Dropdown = (props: Props) => {
  const [click, setCLick] = useState(false);

  const handleClick = () => setCLick(!click);

  return (
    <>
      <ul onClick={handleClick} className={click ? 'dropdown-menu clicked' : 'dropdown-menu'}>
        {props.menuItems.map((item, index) => {
          return (
            <li key={index}>
              <Link className={item.cName} 
                    to={item.path} 
                    onClick={() => setCLick(false)}>
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default Dropdown