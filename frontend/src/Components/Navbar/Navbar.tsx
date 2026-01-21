import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import "./Navbar.scss"
import SearchBar from './SearchBar';

type Props = {}

const Navbar = (props: Props) => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <>
      <nav className='navbar'>
        <div className="navbar-logo-container">
          <Link to='/' className='navbar-logo'>
            <span className="navbar-logo-mark" aria-hidden="true">
              <span className="navbar-logo-angle">&lt;</span>
              <i className="fas fa-wrench navbar-logo-wrench" />
              <span className="navbar-logo-angle">&gt;</span>
            </span>
            <span className="navbar-logo-text">Demi</span>
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
            <Link to='/faq' className='nav-links' onClick={closeMobileMenu}>
              FAQ
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='https://github.com/bobrossrtx/demi-lang' className='nav-links' onClick={closeMobileMenu}>
              Github <i className="fa fa-github"></i>
            </Link>
          </li>
          <SearchBar placeholder='🔎︎ Search Docs' />
        </ul>
      </nav>
    </>
  )
}

export default Navbar;