import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Gavel } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 className="heading-primary" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          Discover, Bid, and Win<br />Amazing Items
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Welcome to BidMaster, the most premium and secure auction platform. Find exclusive electronics, art, vehicles, and more.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auctions" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Explore Auctions <ArrowRight size={20} />
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            Start Selling
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mt-8" style={{ paddingBottom: '4rem' }}>
        <div className="grid grid-cols-3 gap-6">
          <div className="card text-center flex-col items-center gap-4">
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
              <Gavel size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>Live Bidding</h3>
            <p className="text-muted">Experience the thrill of real-time bidding with instant updates and notifications.</p>
          </div>
          
          <div className="card text-center flex-col items-center gap-4">
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--accent)' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>Secure Platform</h3>
            <p className="text-muted">All our sellers are verified, and we ensure maximum security for your data and bids.</p>
          </div>

          <div className="card text-center flex-col items-center gap-4">
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--warning)' }}>
              <Zap size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>Fast Notifications</h3>
            <p className="text-muted">Get instant alerts when you're outbid, or when you win an auction. Never miss out.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
