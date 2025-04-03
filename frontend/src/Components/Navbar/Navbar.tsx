import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "./Navbar.scss";
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';
import logo from './images/demilang-logo.png';

type Props = {}

const Navbar = (props: Props) => {
  const [click, setClick] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

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
            {!isAuthenticated ? (
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
                {user?.username || "Profile"}
              </Link>
              </li>
              <li className='nav-item'>
                <Link to="/" className='nav-links' onClick={handleLogout}>
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