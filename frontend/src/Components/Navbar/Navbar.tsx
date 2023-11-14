import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import "./Navbar.css"
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';
import logo from './images/demilang-logo.png'

type Props = {}

const Navbar = (props: Props) => {
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const onMouseEnter = () => {
    if(window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(true);
    }
  };

  const onMouseLeave = () => {
    if(window.innerWidth < 960) {
      setDropdown(true);
    } else {
      setDropdown(false);
    }
  };

  const servicesDropdown = [
    {
        title: 'Marketing',
        path: '/marketing',
        cName: 'dropdown-link'
    },
    {
        title: 'Development',
        path: '/development',
        cName: 'dropdown-link'
    },
    {
        title: 'Design',
        path: '/design',
        cName: 'dropdown-link'
    }
  ];

  return (
    <>
      <nav className='navbar'>
        <div className="navbar-logo-container">
          <Link to='/' className='navbar-logo'>
            <img src={logo} alt="Logo" className='navbar-logo-img' />
            Demi
          </Link>
        </div>
        <div className='menu-icon' onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className='nav-item'>
            <Link to='/downloads' className='nav-links' onClick={closeMobileMenu}>
              Download
            </Link>
          </li>
          <li className='nav-item'>
            <a href='../docs' className='nav-links' onClick={closeMobileMenu}>
              Docs
            </a>
          </li>
          <li className='nav-item'>
            <Link to='https://github.com/bobrossrtx/demi-lang' className='nav-links' onClick={closeMobileMenu}>
              Github <i className="fa fa-github"></i>
            </Link>
          </li>
          {/* <li className='nav-item'>
            <Link to='/about' className='nav-links' onClick={closeMobileMenu}>
              About
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/contact' className='nav-links' onClick={closeMobileMenu}>
              Contact
            </Link>
          </li> */}
          <SearchBar placeholder='🔎︎ Search Docs' />




          {/* (GOT TO FIGURE OUT WHY DROP DOWN NOT SHOWING) */}
          {/* <li className='nav-item'>
            <Link to='/' className='nav-links' onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className='nav-item' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <Link to='/' className='nav-links' onClick={closeMobileMenu}>
              Services <i className='fas fa-caret-down' />
            </Link>
            {!dropdown && <Dropdown menuItems={servicesDropdown} />}
          </li>
          <li className='nav-item'>
            <Link to='/contact' className='nav-links' onClick={closeMobileMenu}>
              Contact
            </Link>
          </li> */}
        </ul>
        {/* <Button to='/test'>Test</Button> */}
      </nav>
    </>
  )
}

export default Navbar;