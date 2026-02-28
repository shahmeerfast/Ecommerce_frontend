import React, { useState, useEffect } from 'react';
import Notifications from '../Notifications';
import { useShopContext } from '../../context/ShopContext';
import AdminProfileModal from './AdminProfileModal';

const NAVY_DARK_CLASS = 'navy-dark';
const NAVY_DARK_BG = '#232e3c';

const AdminNavbar = ({ setActiveSection, searchTerm, setSearchTerm, onSidebarToggle, isMobile }) => {
  const { user } = useShopContext();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin-navy-dark-mode') === 'true');
  let profileImage = user?.profileImage;
  console.log('AdminNavbar profileImage:', profileImage);
  if (!profileImage) {
    profileImage = 'https://ui-avatars.com/api/?name=Admin&background=3C91E6&color=fff&size=96';
  }

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add(NAVY_DARK_CLASS);
      localStorage.setItem('admin-navy-dark-mode', 'true');
    } else {
      document.body.classList.remove(NAVY_DARK_CLASS);
      localStorage.setItem('admin-navy-dark-mode', 'false');
    }
  }, [darkMode]);

  return (
    <nav className="admin-navbar">
      <span className="admin-navbar-logo">AdminHub</span>
      <i 
        className='bx bx-menu' 
        style={{ cursor: 'pointer' }} 
        onClick={onSidebarToggle}
        title="Toggle Sidebar"
      ></i>
      
      {/* Show Categories link only on desktop */}
      {!isMobile && (
        <a href="#" className="nav-link" onClick={() => setActiveSection && setActiveSection('categories')}>
          Categories
        </a>
      )}
      
      <div className="admin-navbar-right-group">
        <input 
          type="checkbox" 
          id="switch-mode" 
          hidden 
          checked={darkMode} 
          onChange={() => setDarkMode(v => !v)} 
        />
        <label htmlFor="switch-mode" className="switch-mode" title="Toggle Dark Mode"></label>
        <Notifications />
        <button 
          className="profile" 
          style={{ background: 'none', border: 'none', padding: 0 }} 
          onClick={() => setShowProfileModal(true)}
          title="Profile"
        >
          <img src={profileImage} alt="Profile" />
        </button>
      </div>
      <AdminProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </nav>
  );
};

export default AdminNavbar; 