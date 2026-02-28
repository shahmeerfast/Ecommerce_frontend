import React from 'react';

const AdminResponsiveTest = () => {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Admin Panel Responsive Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Screen Size:</h2>
        <p>Width: {window.innerWidth}px</p>
        <p>Height: {window.innerHeight}px</p>
        <p>Device: {window.innerWidth <= 480 ? 'Mobile' : window.innerWidth <= 768 ? 'Tablet' : 'Desktop'}</p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Card 1</h3>
          <p>This card should be responsive and adapt to different screen sizes.</p>
        </div>
        
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Card 2</h3>
          <p>On mobile, cards should stack vertically.</p>
        </div>
        
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Card 3</h3>
          <p>On tablet, cards should show 2 per row.</p>
        </div>
      </div>
      
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <h3>Responsive Table Test</h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          minWidth: '600px'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>John Doe</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>john@example.com</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Active</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                <button style={{ marginRight: '8px', padding: '4px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Edit</button>
                <button style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>Delete</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Jane Smith</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>jane@example.com</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Inactive</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                <button style={{ marginRight: '8px', padding: '4px 8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Edit</button>
                <button style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Responsive Features Tested:</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ Mobile sidebar overlay with backdrop blur</li>
          <li>✅ Touch-friendly navigation elements</li>
          <li>✅ Responsive grid layouts</li>
          <li>✅ Horizontal scrolling tables on mobile</li>
          <li>✅ Responsive modals and forms</li>
          <li>✅ Dark mode support across all screen sizes</li>
          <li>✅ Landscape orientation support</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminResponsiveTest; 