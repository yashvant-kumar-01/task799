import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';

const AuctionList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [auctionData, setAuctionData] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axiosInstance.get('/auctions?status=active');
        setAuctionData(res.data.data);
      } catch (err) {
        setError('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const filteredAuctions = auctionData.filter(auction => 
    auction.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="heading-secondary mb-0">Live Auctions</h1>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search auctions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {filteredAuctions.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-muted">No active auctions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredAuctions.map(auction => (
            <Link to={`/auctions/${auction._id}`} key={auction._id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={auction.image} alt={auction.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--border-radius) var(--border-radius) 0 0' }} />
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{auction.title}</h3>
                  <span className="badge badge-primary">{auction.category}</span>
                </div>
                <p className="text-muted mb-4" style={{ flex: 1 }}>{auction.description.substring(0, 80)}...</p>
                
                <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Current Bid</span>
                    <span className="text-primary" style={{ fontSize: '1.2rem', fontWeight: '700' }}>${auction.currentPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>Ends In</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                      {formatDistanceToNow(new Date(auction.endDate))}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionList;
