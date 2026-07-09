import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Gavel, Bell, LogOut, User as UserIcon } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    // Fetch unread notification count
    const fetchUnread = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        const unread = res.data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch {
        // silently ignore
      }
    };
    fetchUnread();
    // Refresh every 60 seconds
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    setUnreadCount(0);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'seller') return '/seller-dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <Gavel className="text-primary" size={28} />
          <span>Bid</span>Master
        </Link>

        <div className="nav-links">
          <Link to="/auctions" className="nav-link">Explore</Link>
          
          {user ? (
            <>
              <Link to="/notifications" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="badge badge-primary">{unreadCount}</span>
                )}
              </Link>
              
              <Link to={getDashboardLink()} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <UserIcon size={18} />
                Dashboard
              </Link>

              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
