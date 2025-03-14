import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import "./Navbar.scss"
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';
import logo from './images/demilang-logo.png'

type Props = {}

const Navbar = (props: Props) => {
  const [click, setClick] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

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
          <SearchBar placeholder='🔎︎ Search Docs' />
            {!isLoggedIn ? (
            <>
              <li className='nav-item'>
              <Link to="/login" className='nav-links' onClick={closeMobileMenu}>
                Log In
              </Link>
              </li>
              <li className='nav-item'>
              <Link to="/register" className='nav-links' onClick={closeMobileMenu}>
                Register
              </Link>
              </li>
            </>
            ) : (
            <>
              <li className='nav-item'>
              <Link to="/profile" className='nav-links' onClick={closeMobileMenu}>
                Profile
              </Link>
              </li>
              <li className='nav-item'>
              <Link to="/logout" className='nav-links' onClick={closeMobileMenu}>
                Log Out
              </Link>
              </li>
            </>
            )}
        </ul>
      </nav>
    </>
  )
}

export default Navbar;