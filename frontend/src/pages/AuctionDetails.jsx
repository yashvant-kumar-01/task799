import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Tag, User as UserIcon, AlertCircle } from 'lucide-react';

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  useEffect(() => {
    fetchAuction();
  }, [id]);

  const fetchAuction = async () => {
    try {
      const res = await axiosInstance.get(`/auctions/${id}`);
      setAuction(res.data.data);
      // Set initial bid amount suggestion
      setBidAmount(res.data.data.currentPrice + 10);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBidError(null);
    setBidSuccess(null);
    setBidLoading(true);

    try {
      await axiosInstance.post(`/auctions/${id}/bids`, { amount: Number(bidAmount) });
      setBidSuccess('Bid placed successfully!');
      fetchAuction(); // Refresh auction data
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (error) return <div className="container mt-8"><div className="alert alert-error">{error}</div></div>;
  if (!auction) return null;

  const isActive = auction.status === 'active' && new Date() < new Date(auction.endDate);
  const isSeller = user && user._id === auction.seller._id;

  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-8" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Left Column: Image & Details */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
            <img src={auction.image} alt={auction.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
          </div>
          
          <div className="card">
            <h1 className="heading-secondary mb-4">{auction.title}</h1>
            
            <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-primary flex items-center gap-2">
                <Tag size={14} /> {auction.category}
              </span>
              <span className={`badge ${isActive ? 'badge-active' : 'badge-closed'} flex items-center gap-2`}>
                <Clock size={14} /> 
                {isActive ? 'Active' : 'Closed'}
              </span>
              <span className="badge flex items-center gap-2" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
                <UserIcon size={14} /> Seller: {auction.seller.name}
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Description</h3>
            <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{auction.description}</p>
          </div>
        </div>

        {/* Right Column: Bidding panel */}
        <div>
          <div className="card mb-6" style={{ borderTop: '4px solid var(--primary)' }}>
            <div className="text-center mb-6">
              <p className="text-muted mb-1">Current Price</p>
              <h2 style={{ fontSize: '3rem', color: 'var(--primary)', lineHeight: '1' }}>${auction.currentPrice}</h2>
              <p className="text-muted mt-2">Starting price: ${auction.startPrice}</p>
            </div>

            <div className="mb-6 p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--border-radius-sm)' }}>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Status</span>
                <span style={{ fontWeight: '600', color: isActive ? 'var(--accent)' : 'var(--danger)' }}>
                  {isActive ? 'Accepting Bids' : 'Auction Ended'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Ends</span>
                <span style={{ fontWeight: '500' }}>{format(new Date(auction.endDate), 'MMM dd, yyyy h:mm a')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Bids</span>
                <span style={{ fontWeight: '500' }}>{auction.totalBids}</span>
              </div>
            </div>

            {bidSuccess && <div className="alert alert-success">{bidSuccess}</div>}
            {bidError && <div className="alert alert-error">{bidError}</div>}

            {isActive ? (
              isSeller ? (
                <div className="alert flex items-start gap-2" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                  <AlertCircle size={20} />
                  <span>You cannot bid on your own auction.</span>
                </div>
              ) : (
                <form onSubmit={handleBid}>
                  <div className="form-group">
                    <label className="form-label">Your Bid Amount ($)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={auction.currentPrice + 1}
                      required 
                      style={{ fontSize: '1.2rem', padding: '1rem' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" style={{ fontSize: '1.1rem', padding: '1rem' }} disabled={bidLoading}>
                    {bidLoading ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                  {!user && <p className="text-muted text-center mt-2" style={{ fontSize: '0.9rem' }}>You will be redirected to login.</p>}
                </form>
              )
            ) : (
               <div className="card text-center py-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                 <p style={{ color: 'var(--danger)', fontWeight: '600' }}>This auction is closed.</p>
                 {auction.winner && (
                   <p className="mt-2 text-muted">Won by bidder ID: {auction.winner}</p>
                 )}
               </div>
            )}
          </div>

          {/* Bid History */}
          <div className="card">
            <h3 className="mb-4 flex items-center gap-2"><Clock size={18}/> Bid History</h3>
            {auction.bids && auction.bids.length > 0 ? (
              <div className="flex-col gap-4">
                {auction.bids.map((bid, index) => (
                  <div key={bid._id} className="flex justify-between items-center p-3" style={{ backgroundColor: index === 0 ? 'var(--primary-light)' : 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--border-radius-sm)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {bid.bidder?.avatar ? <img src={bid.bidder.avatar} alt="avatar" /> : <UserIcon size={16} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: index === 0 ? '600' : '500', fontSize: '0.95rem' }}>{bid.bidder?.name || 'Unknown User'}</p>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDistanceToNow(new Date(bid.createdAt))} ago</p>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: index === 0 ? 'var(--primary)' : 'inherit' }}>
                      ${bid.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-4">No bids placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
