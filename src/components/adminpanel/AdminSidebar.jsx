import React from 'react';
import { useShopContext } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeSection, setActiveSection, sidebarOpen, isMobile }) => {
  const { setUser, setToken, user, handleLogout } = useShopContext();
  const navigate = useNavigate();

  const sidebarClass = isMobile 
    ? `mobile-sidebar ${sidebarOpen ? 'show' : ''}`
    : sidebarOpen ? '' : 'hide';

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setActiveSection(activeSection)}
        />
      )}
      
      <section id="sidebar" className={sidebarClass}>
        <a href="#" className="brand">
          <i className='bx bxs-smile'></i>
          <span className="text">AdminHub</span>
        </a>
        <ul className="side-menu top">
          <li className={activeSection === 'dashboard' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('dashboard')}>
              <i className='bx bxs-dashboard'></i>
              <span className="text">Dashboard</span>
            </a>
          </li>
          <li className={activeSection === 'mystore' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('mystore')}>
              <i className='bx bxs-shopping-bag-alt'></i>
              <span className="text">My Store</span>
            </a>
          </li>
          <li className={activeSection === 'analytics' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('analytics')}>
              <i className='bx bxs-doughnut-chart'></i>
              <span className="text">Analytics</span>
            </a>
          </li>
          <li className={activeSection === 'message' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('message')}>
              <i className='bx bxs-message-dots'></i>
              <span className="text">Message</span>
            </a>
          </li>
          <li className={activeSection === 'team' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('team')}>
              <i className='bx bxs-group'></i>
              <span className="text">User (buyer)</span>
            </a>
          </li>
          <li className={activeSection === 'sellers' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('sellers')}>
              <i className='bx bxs-store'></i>
              <span className="text">Sellers</span>
            </a>
          </li>
          <li className={activeSection === 'payouts' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('payouts')}>
              <i className='bx bxs-credit-card'></i>
              <span className="text">Payouts</span>
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li className={activeSection === 'settings' ? 'active' : ''}>
            <a href="#" onClick={() => setActiveSection('settings')}>
              <i className='bx bxs-cog'></i>
              <span className="text">Settings</span>
            </a>
          </li>
          <li>
            <a href="#" className="logout" onClick={handleLogout}>
              <i className='bx bxs-log-out-circle'></i>
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
};

export default AdminSidebar; 