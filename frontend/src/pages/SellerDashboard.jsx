import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Plus, Edit, Trash2 } from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    startPrice: '',
    endDate: ''
  });

  const fetchMyAuctions = async () => {
    try {
      const res = await axiosInstance.get(`/auctions?seller=${user._id}`);
      setAuctions(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions();
  }, [user._id]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auctions', formData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', category: 'Other', startPrice: '', endDate: '' });
      fetchMyAuctions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create auction');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this auction?')) {
      try {
        await axiosInstance.delete(`/auctions/${id}`);
        fetchMyAuctions();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="container page-enter">
      <div className="flex justify-between items-center mb-2">
        <h1 className="heading-secondary mb-0">Seller Dashboard</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={18} /> Create Auction
        </button>
      </div>
      <h3 className="text-muted mb-8" style={{ fontWeight: 400 }}>
        Welcome back, <span className="text-primary" style={{ fontWeight: 600 }}>{user?.name}</span>!
      </h3>

      {loading ? (
        <div className="loader-container"><div className="spinner"></div></div>
      ) : (
        <div className="card">
          <h3 className="mb-4">My Auctions</h3>
          
          {auctions.length === 0 ? (
            <p className="text-muted text-center py-4">You haven't created any auctions yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>Title</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Current Price</th>
                    <th style={{ padding: '1rem' }}>Bids</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map(auction => (
                    <tr key={auction._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{auction.title}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${auction.status === 'active' ? 'badge-active' : 'badge-closed'}`}>
                          {auction.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>${auction.currentPrice}</td>
                      <td style={{ padding: '1rem' }}>{auction.totalBids}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Edit (Coming soon)">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(auction._id)} className="btn btn-danger" style={{ padding: '0.5rem' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Basic Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="mb-4">Create New Auction</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input required type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required className="form-control" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Electronics">Electronics</option>
                  <option value="Art">Art</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Collectibles">Collectibles</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Price ($)</label>
                  <input required type="number" min="1" className="form-control" value={formData.startPrice} onChange={e => setFormData({...formData, startPrice: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input required type="datetime-local" className="form-control" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
