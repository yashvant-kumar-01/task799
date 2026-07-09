import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Gavel, DollarSign, Activity } from 'lucide-react';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [statsRes, monthlyRes] = await Promise.all([
          axiosInstance.get('/admin/reports'),
          axiosInstance.get('/admin/reports/monthly')
        ]);
        
        setStats(statsRes.data.data);
        setMonthlyData(monthlyRes.data.data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="container">
      <h1 className="heading-secondary mb-6">Platform Reports</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Total Users</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats?.users.total}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <Gavel size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Total Auctions</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats?.auctions.total}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Est. Revenue</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>${stats?.financials.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Total Bids</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats?.bids.total}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="mb-6">User Registrations (Current Year)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="users" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-6">Auction Creation Trend</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="auctions" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card">
        <h3 className="mb-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-muted mb-2 border-b" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>User Roles</h4>
            <div className="flex justify-between py-2 border-b" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Buyers</span>
              <span className="font-bold">{stats?.users.buyers}</span>
            </div>
            <div className="flex justify-between py-2 border-b" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Sellers</span>
              <span className="font-bold">{stats?.users.sellers}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Admins</span>
              <span className="font-bold">{stats?.users.admins}</span>
            </div>
          </div>
          <div>
            <h4 className="text-muted mb-2 border-b" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Auction Status</h4>
            <div className="flex justify-between py-2 border-b" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Active</span>
              <span className="font-bold text-accent" style={{ color: 'var(--accent)' }}>{stats?.auctions.active}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Closed</span>
              <span className="font-bold text-danger" style={{ color: 'var(--danger)' }}>{stats?.auctions.closed}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminReports;
