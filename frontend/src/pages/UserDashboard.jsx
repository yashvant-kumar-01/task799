// ============================================
// pages/UserDashboard.jsx - Buyer Dashboard with Razorpay
// Task 799 - MERN Auction Platform
// ============================================

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { User, Mail, Shield, CreditCard, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock payment simulation modal state
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [mockOrderInfo, setMockOrderInfo] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchWonAuctions = async () => {
    try {
      // Use dedicated /won endpoint for reliable ObjectId matching
      const res = await axiosInstance.get('/auctions/won');
      setWonAuctions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching won auctions:', err);
      setWonAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchWonAuctions();
    }
  }, [user?._id]);

  // Load Razorpay checkout SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (auctionId) => {
    try {
      const res = await axiosInstance.post('/payments/order', { auctionId });
      const orderData = res.data;

      if (orderData.mock) {
        // Show simulation modal for mock payment environment
        setMockOrderInfo(orderData);
        setShowSimulateModal(true);
      } else {
        // Load Razorpay Overlay
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert('Failed to load Razorpay SDK. Please check your internet connection.');
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'BidMaster Platform',
          description: `Payment for auction item: ${orderData.title}`,
          order_id: orderData.order_id,
          handler: async function (response) {
            try {
              const verifyRes = await axiosInstance.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                alert('Payment captured & verified successfully!');
                fetchWonAuctions();
              }
            } catch (err) {
              alert(err.response?.data?.message || 'Payment verification failed.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#6366f1',
          },
        };

        const razorpayObject = new window.Razorpay(options);
        razorpayObject.open();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment.');
    }
  };

  const downloadInvoice = (auction) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      alert('Pop-up blocker is enabled. Please allow pop-ups to download the invoice.');
      return;
    }

    const invoiceDate = new Date(auction.updatedAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const paymentId = auction.razorpayPaymentId || 'N/A';
    const orderId = auction.razorpayOrderId || 'N/A';
    const amount = (auction.currentPrice || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${auction.title}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 30px;
            background-color: #fff;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            font-size: 16px;
            line-height: 24px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366f1;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: 300;
            text-align: right;
            color: #4a5568;
          }
          .details-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          .details-column {
            width: 48%;
          }
          .details-column h3 {
            font-size: 14px;
            text-transform: uppercase;
            color: #718096;
            margin-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .details-column p {
            margin: 0 0 5px 0;
            font-size: 15px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .table th {
            background-color: #f7fafc;
            color: #4a5568;
            font-weight: bold;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #e2e8f0;
          }
          .table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .total-box {
            width: 250px;
            border-top: 2px solid #e2e8f0;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #6366f1;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #a0aec0;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .btn-print {
            background-color: #6366f1;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            float: right;
            margin-bottom: 20px;
          }
          @media print {
            .btn-print {
              display: none;
            }
            body {
              padding: 0;
            }
            .invoice-box {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
        <div class="invoice-box">
          <div class="header">
            <div class="logo">BidMaster</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="details-container">
            <div class="details-column">
              <h3>Billed To:</h3>
              <p><strong>${user?.name || 'N/A'}</strong></p>
              <p>${user?.email || 'N/A'}</p>
            </div>
            <div class="details-column" style="text-align: right;">
              <h3>Invoice Info:</h3>
              <p><strong>Date:</strong> ${invoiceDate}</p>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
            </div>
          </div>

          <div class="details-container" style="margin-top: -20px;">
            <div class="details-column">
              <h3>Merchant/Seller:</h3>
              <p><strong>${auction.seller?.name || 'BidMaster Seller'}</strong></p>
              <p>${auction.seller?.email || ''}</p>
            </div>
            <div class="details-column" style="text-align: right;">
              <h3>Status:</h3>
              <p style="color: #38a169; font-weight: bold;">PAID (Razorpay)</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Auction Item Description</th>
                <th style="text-align: right;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${auction.title}</strong><br>
                  <span style="font-size: 13px; color: #718096;">Won via competitive bidding on BidMaster platform.</span>
                </td>
                <td style="text-align: right;">1</td>
                <td style="text-align: right;">${amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${amount}</span>
              </div>
              <div class="total-row">
                <span>Tax (0%):</span>
                <span>₹0.00</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Paid:</span>
                <span>${amount}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Thank you for participating in BidMaster auctions!<br>
            If you have any questions, please contact support@bidmaster.com
          </div>
        </div>
      </body>
      </html>
    `;

    invoiceWindow.document.write(htmlContent);
    invoiceWindow.document.close();
  };

  const executeMockPayment = async (simulateSuccess) => {
    if (!mockOrderInfo) return;
    setSimulating(true);

    try {
      if (simulateSuccess) {
        const verifyRes = await axiosInstance.post('/payments/verify', {
          razorpay_order_id: mockOrderInfo.order_id,
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
        });

        if (verifyRes.data.success) {
          alert('Mock payment simulated successfully!');
          fetchWonAuctions();
        }
      } else {
        alert('Mock payment simulation cancelled.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Mock verification failed.');
    } finally {
      setSimulating(false);
      setShowSimulateModal(false);
      setMockOrderInfo(null);
    }
  };

  return (
    <div className="container page-enter">
      <h1 className="heading-secondary mb-2">Buyer Dashboard</h1>
      <h3 className="text-muted mb-8" style={{ fontWeight: 400 }}>
        Welcome back, <span className="text-primary" style={{ fontWeight: 600 }}>{user?.name}</span>!
      </h3>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card flex-col gap-6" style={{ height: 'fit-content' }}>
          <h3 className="mb-0 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Profile Information</h3>
          <div className="flex items-center gap-4">
            <img 
              src={user?.avatar} 
              alt="Profile" 
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
            />
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{user?.name}</h2>
              <span className="badge badge-primary mt-2" style={{ display: 'inline-block' }}>Buyer Account</span>
            </div>
          </div>
          
          <div className="flex-col gap-4">
            <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.95rem' }}>
              <Mail size={18} /> <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.95rem' }}>
              <Shield size={18} /> <span>Role: {user?.role}</span>
            </div>
            <div className="flex items-center gap-3 text-muted" style={{ fontSize: '0.95rem' }}>
              <User size={18} /> <span>Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Won Auctions Section */}
        <div className="card grid-cols-1 col-span-2" style={{ gridColumn: 'span 2' }}>
          <h3 className="mb-6 flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <CheckCircle className="text-accent" size={22} /> Won Auctions & Payments
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" style={{ width: '35px', height: '35px' }}></div>
            </div>
          ) : wonAuctions.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Clock size={40} className="mx-auto mb-2 opacity-50" style={{ margin: '0 auto' }} />
              <p>You haven't won any auctions yet.</p>
            </div>
          ) : (
            <div className="flex-col gap-4">
              {wonAuctions.map(auction => (
                <div 
                  key={auction._id} 
                  className="flex items-center justify-between"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: 'var(--border-radius-sm)', 
                    background: 'rgba(15, 23, 42, 0.4)', 
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={auction.image} 
                      alt={auction.title} 
                      style={{ width: '60px', height: '60px', borderRadius: 'var(--border-radius-sm)', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60?text=Item' }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{auction.title}</h4>
                      <div className="flex items-center gap-3 mt-1" style={{ fontSize: '0.85rem' }}>
                        <span className="text-muted">Winning Bid:</span>
                        <span style={{ fontWeight: 600, color: 'white' }}>₹{auction.currentPrice?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {auction.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-active flex items-center gap-1">
                          <CheckCircle size={14} /> Paid
                        </span>
                        <button 
                          onClick={() => downloadInvoice(auction)} 
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Print / Save Invoice PDF"
                        >
                          <FileText size={14} /> Invoice
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="badge badge-closed flex items-center gap-1" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                          <Clock size={14} /> Pending Payment
                        </span>
                        <button 
                          onClick={() => handlePayment(auction._id)} 
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}
                        >
                          <CreditCard size={16} /> Pay Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Basic Modal Overlay for Mock Payment Simulation */}
      {showSimulateModal && mockOrderInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--primary)', padding: '2rem' }}>
            <h2 className="mb-4 text-center flex justify-center items-center gap-2" style={{ color: 'var(--warning)' }}>
              <AlertCircle size={28} /> Payment Simulation
            </h2>
            
            <p className="text-center mb-6" style={{ fontSize: '0.95rem' }}>
              Razorpay API keys are not configured. The platform is running in <strong>Mock Simulation Mode</strong>.
            </p>
            
            <div 
              className="flex-col gap-2 mb-6" 
              style={{ background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            >
              <div className="flex justify-between">
                <span className="text-muted">Item:</span>
                <span>{mockOrderInfo.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mock Order ID:</span>
                <span>{mockOrderInfo.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Amount due:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{(mockOrderInfo.amount / 100).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex-col gap-2">
              <button 
                onClick={() => executeMockPayment(true)} 
                className="btn btn-primary w-full"
                disabled={simulating}
              >
                {simulating ? 'Simulating success...' : 'Simulate Success ✔'}
              </button>
              <button 
                onClick={() => executeMockPayment(false)} 
                className="btn btn-outline w-full"
                disabled={simulating}
              >
                Cancel Payment ✖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
