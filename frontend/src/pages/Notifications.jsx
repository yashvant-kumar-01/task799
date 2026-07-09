import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-secondary mb-0 flex items-center gap-3">
          <Bell className="text-primary" /> Notifications
          {unreadCount > 0 && <span className="badge badge-primary">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <Check size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="card flex-col gap-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Bell size={48} className="mx-auto mb-4 opacity-50" style={{ margin: '0 auto' }}/>
            <p>You have no notifications right now.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              style={{ 
                padding: '1.25rem', 
                borderLeft: notification.isRead ? '4px solid transparent' : '4px solid var(--primary)',
                backgroundColor: notification.isRead ? 'rgba(15, 23, 42, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                transition: 'all 0.3s'
              }}
            >
              <div>
                <p style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: notification.isRead ? 'var(--text-muted)' : 'white' }}>
                  {notification.message}
                </p>
                <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                  <span>{formatDistanceToNow(new Date(notification.createdAt))} ago</span>
                  {notification.relatedAuction && (
                    <Link to={`/auctions/${notification.relatedAuction._id}`} className="text-primary hover:underline">
                      View Auction
                    </Link>
                  )}
                </div>
              </div>
              
              {!notification.isRead && (
                <button 
                  onClick={() => markAsRead(notification._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Mark as read"
                >
                  <Check size={20} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
