import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import AdminDashboardHome from './AdminDashboardHome';
import '../../styles/adminpanel.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminMyStore from './AdminMyStore';
import AdminAnalytics from './AdminAnalytics';
import AdminMessages from './AdminMessages';
import AdminTeam from './AdminTeam';
import AdminSellers from './AdminSellers';
import AdminSettings from './AdminSettings';
import AdminCategories from './AdminCategories';
import AdminPayouts from './AdminPayouts';

const AdminPanelLayout = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(open => !open);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Close sidebar on mobile when section changes
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-panel-root">
      <ToastContainer />
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} 
        sidebarOpen={sidebarOpen} 
        isMobile={isMobile}
      />
      <section id="content" onClick={handleContentClick}>
        <AdminNavbar 
          setActiveSection={handleSectionChange} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onSidebarToggle={handleSidebarToggle}
          isMobile={isMobile}
        />
        {activeSection === 'dashboard' && <AdminDashboardHome searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeSection === 'mystore' && <AdminMyStore />}
        {activeSection === 'analytics' && <AdminAnalytics />}
        {activeSection === 'message' && <AdminMessages />}
        {activeSection === 'team' && <AdminTeam />}
        {activeSection === 'sellers' && <AdminSellers />}
        {activeSection === 'settings' && <AdminSettings />}
        {activeSection === 'categories' && <AdminCategories />}
        {activeSection === 'payouts' && <AdminPayouts />}
      </section>
    </div>
  );
};

export default AdminPanelLayout; 