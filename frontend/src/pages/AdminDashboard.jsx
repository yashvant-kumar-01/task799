import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, Gavel, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container page-enter">
      <h1 className="heading-secondary mb-2">Admin Dashboard</h1>
      <h3 className="text-muted mb-8" style={{ fontWeight: 400 }}>
        Welcome back, <span className="text-primary" style={{ fontWeight: 600 }}>{user?.name}</span> (Administrator)!
      </h3>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Link to="/admin-reports" className="card flex flex-col items-center justify-center text-center py-8" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <BarChart size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Platform Reports</h3>
          <p className="text-muted mt-2">View revenue, user growth, and auction stats</p>
        </Link>
        
        <div className="card flex flex-col items-center justify-center text-center py-8 opacity-50 cursor-not-allowed">
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--accent)', marginBottom: '1rem' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Manage Users</h3>
          <p className="text-muted mt-2">Suspend or remove users (Coming Soon)</p>
        </div>
        
        <div className="card flex flex-col items-center justify-center text-center py-8 opacity-50 cursor-not-allowed">
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--warning)', marginBottom: '1rem' }}>
            <Gavel size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Manage Auctions</h3>
          <p className="text-muted mt-2">Moderate platform listings (Coming Soon)</p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-4 flex items-center gap-2"><FileText size={20}/> Admin Tools & Logs</h3>
        <p className="text-muted mb-4">
          Welcome to the administrator control panel. Navigate to Platform Reports to see real-time statistics aggregated from the backend.
        </p>
        <Link to="/admin-reports" className="btn btn-primary">View Full Reports</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
