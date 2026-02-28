import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [ordersOverTime, setOrdersOverTime] = useState([]);
  const [revenueOverTime, setRevenueOverTime] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userSignups, setUserSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, ordersRes, revenueRes, topProductsRes, userSignupsRes] = await Promise.all([
          axios.get('/api/analytics/summary'),
          axios.get('/api/analytics/orders-over-time'),
          axios.get('/api/analytics/revenue-over-time'),
          axios.get('/api/analytics/top-products'),
          axios.get('/api/analytics/user-signups-over-time'),
        ]);
        setSummary(summaryRes.data);
        setOrdersOverTime(ordersRes.data);
        setRevenueOverTime(revenueRes.data);
        setTopProducts(topProductsRes.data);
        setUserSignups(userSignupsRes.data);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading analytics...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>;

  return (
    <div className="admin-analytics-root" style={{ padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Analytics</h1>
      {/* Summary Cards */}
      <div className="admin-analytics-cards">
        <div className="admin-analytics-card">
          <div className="admin-card-muted">Total Sales</div>
          <div className="admin-analytics-value">₦{summary.totalSales?.toLocaleString()}</div>
        </div>
        <div className="admin-analytics-card">
          <div className="admin-card-muted">Total Orders</div>
          <div className="admin-analytics-value">{summary.totalOrders?.toLocaleString()}</div>
        </div>
        <div className="admin-analytics-card">
          <div className="admin-card-muted">Total Users</div>
          <div className="admin-analytics-value">{summary.totalUsers?.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="admin-analytics-charts">
        <div className="admin-analytics-chart">
          <h3>Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ordersOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="_id" />
              <YAxis allowDecimals={false} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-analytics-chart">
          <h3>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="_id" />
              <YAxis tickFormatter={value => `₦${value.toLocaleString()}`} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={value => `₦${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="total" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 32 }}>
        {/* Top Products */}
        <div className="admin-analytics-card" style={{ flex: 1, minWidth: 350, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Top Products</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value, name) => name === 'totalSold' ? value : `₦${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="totalSold" fill="#ffc658" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* User Signups Over Time */}
        <div className="admin-analytics-card" style={{ flex: 1, minWidth: 350, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>User Signups Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userSignups} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="_id" />
              <YAxis allowDecimals={false} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ff7300" name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 