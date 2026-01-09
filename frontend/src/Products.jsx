// src/Products.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { products } from "./productsData";

/* ================================
   CONTRACT ADDRESSES & ABIs
================================ */
const DEFAULT_ADDRESSES = {
  MNEE: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  Commerce: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
};

const mneeABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const commerceABI = [
  "function buy(uint256 amount) external",
  "function refund(uint256 orderId) external",
];

// Function to load contract addresses from JSON file
async function loadContractAddresses() {
  try {
    const response = await fetch('/contract-addresses.json');
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Loaded contract addresses:", data);
      return data;
    }
  } catch (error) {
    console.log("⚠️ Using default contract addresses");
  }
  return DEFAULT_ADDRESSES;
}

export default function Products() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [orders, setOrders] = useState([]);
  const [contractAddresses, setContractAddresses] = useState(DEFAULT_ADDRESSES);
  const [loading, setLoading] = useState(false);

  // Load contract addresses on component mount
  useEffect(() => {
    loadContractAddresses().then(addresses => {
      setContractAddresses(addresses);
    });
  }, []);

  /* 🔌 CONNECT WALLET */
  async function connectWallet() {
    if (!window.ethereum) {
      setStatus({ type: "error", message: "Please install MetaMask to use this dApp" });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = (await signer.getAddress()).toLowerCase();
      
      setAccount(addr);
      setStatus({ type: "success", message: "Wallet connected successfully!" });
      
      // Fetch orders
      const res = await fetch(`http://localhost:4000/orders/${addr}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setStatus({ type: "error", message: "Failed to connect wallet" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* 🛒 BUY PRODUCT */
  async function buyProduct(price, name) {
    if (!account) {
      setStatus({ type: "error", message: "Please connect your wallet first" });
      return;
    }

    try {
      setStatus({ type: "loading", message: `Processing ${name} purchase...` });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const mnee = new ethers.Contract(contractAddresses.MNEE, mneeABI, signer);
      const commerce = new ethers.Contract(contractAddresses.Commerce, commerceABI, signer);

      const amount = ethers.parseEther(price.toString());

      // Approve MNEE tokens
      setStatus({ type: "loading", message: "Approving MNEE tokens..." });
      const approveTx = await mnee.approve(contractAddresses.Commerce, amount);
      await approveTx.wait();

      // Execute purchase
      setStatus({ type: "loading", message: "Confirming purchase on blockchain..." });
      const buyTx = await commerce.buy(amount);
      await buyTx.wait();

      setStatus({ 
        type: "success", 
        message: `🎉 ${name} purchased successfully! Transaction confirmed.` 
      });

      // Refresh orders
      const res = await fetch(`http://localhost:4000/orders/${account}`);
      setOrders(await res.json());
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: "error", 
        message: err.message.includes("user rejected") 
          ? "Transaction rejected by user" 
          : "Transaction failed. Please try again." 
      });
    }
  }

  /* 🔄 REFUND */
  async function refundOrder(orderId, productName) {
    if (!confirm(`Are you sure you want to refund ${productName}?`)) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const commerce = new ethers.Contract(contractAddresses.Commerce, commerceABI, signer);
      await commerce.refund(orderId);
      
      setStatus({ type: "success", message: "Refund processed successfully!" });
      
      // Refresh orders
      const res = await fetch(`http://localhost:4000/orders/${account}`);
      setOrders(await res.json());
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Refund failed. Please try again." });
    }
  }

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!account) return;
    
    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:4000/orders/${account}`);
      setOrders(await res.json());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [account]);

  return (
    <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <div className="products-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>
          MNEE Marketplace
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Purchase digital products with programmable MNEE tokens
        </p>
      </div>

      {/* Status Banner */}
      {status.message && (
        <div className={`status-message ${status.type === 'success' ? 'status-success' : status.type === 'error' ? 'status-error' : 'status-loading'}`}
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: status.type === 'success' ? '#d1fae5' : 
                           status.type === 'error' ? '#fee2e2' : 
                           '#dbeafe',
            border: `1px solid ${status.type === 'success' ? '#a7f3d0' : 
                               status.type === 'error' ? '#fecaca' : 
                               '#bfdbfe'}`,
            color: status.type === 'success' ? '#065f46' : 
                  status.type === 'error' ? '#991b1b' : 
                  '#1e40af'
          }}>
          {status.type === 'loading' && (
            <div style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          )}
          {status.type === 'success' && '✅'}
          {status.type === 'error' && '❌'}
          <span style={{ fontWeight: '500' }}>{status.message}</span>
        </div>
      )}

      {/* Wallet Section */}
      <div className="wallet-section" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0'
      }}>
        {!account ? (
          <button 
            className="btn btn-primary" 
            onClick={connectWallet}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Connecting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 01-2-2 2 2 0 012-2h14v4"></path>
                  <path d="M3 5v14a2 2 0 002 2h16v-5"></path>
                  <path d="M18 12a2 2 0 100-4 2 2 0 000 4z"></path>
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        ) : (
          <div className="wallet-info" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '0.75rem',
              height: '0.75rem',
              backgroundColor: '#10b981',
              borderRadius: '50%'
            }}></div>
            <span style={{ fontWeight: '500', color: '#333' }}>Connected</span>
            <span className="wallet-address" style={{
              fontFamily: "'Monaco', 'Courier New', monospace",
              backgroundColor: '#e2e8f0',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}>
              {account.slice(0, 8)}...{account.slice(-6)}
            </span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="products-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {products.map((p, i) => (
          <div key={i} className="card card-hover product-card" style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="product-image" style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: '#eff6ff',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div className="product-info" style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                {p.name}
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Instant digital delivery upon purchase
              </p>
              <div style={{ marginTop: 'auto' }}>
                <p className="product-price" style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#3b82f6',
                  marginBottom: '1rem'
                }}>
                  {p.price} MNEE
                </p>
                <button 
                  className="btn btn-primary" 
                  disabled={!account} 
                  onClick={() => buyProduct(p.price, p.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: !account ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: !account ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (account) e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    if (account) e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                  </svg>
                  {!account ? 'Connect Wallet to Buy' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr className="divider" style={{
        border: 'none',
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '2rem 0'
      }} />

      {/* Orders Section */}
      <div className="orders-section" style={{ marginBottom: '3rem' }}>
        <h2 className="section-title" style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Order History
        </h2>

        {!account ? (
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px dashed #d1d5db'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ marginBottom: '1rem' }}>
              <path d="M21 12V7H5a2 2 0 01-2-2 2 2 0 012-2h14v4"></path>
              <path d="M3 5v14a2 2 0 002 2h16v-5"></path>
              <path d="M18 12a2 2 0 100-4 2 2 0 000 4z"></path>
            </svg>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Connect your wallet to view order history</p>
            <button 
              className="btn btn-outline" 
              onClick={connectWallet}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Connect Wallet
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px dashed #d1d5db'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ marginBottom: '1rem' }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 01-8 0"></path>
            </svg>
            <p style={{ color: '#6b7280' }}>No orders yet. Your purchases will appear here.</p>
          </div>
        ) : (
          <div className="orders-grid" style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {orders.map((o) => (
              <div key={o.tx_hash} className="card order-card" style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div className="order-info" style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                    {o.product_name || 'Unknown Product'}
                  </h4>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#666', fontSize: '0.875rem' }}>Amount: </span>
                      <strong style={{ color: '#3b82f6' }}>{o.amount} MNEE</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '0.875rem' }}>Date: </span>
                      <span>{new Date(o.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', fontSize: '0.875rem' }}>TX: </span>
                      <span style={{ fontFamily: "'Monaco', 'Courier New', monospace", fontSize: '0.75rem' }}>
                        {o.tx_hash?.slice(0, 8)}...{o.tx_hash?.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`order-status ${o.refunded ? 'status-refunded' : 'status-completed'}`}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: o.refunded ? '#fef3c7' : '#d1fae5',
                      color: o.refunded ? '#92400e' : '#065f46'
                    }}>
                    {o.refunded ? 'Refunded' : 'Completed'}
                  </span>
                  {!o.refunded && (
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => refundOrder(o.order_id, o.product_name)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: 'transparent',
                        color: '#f59e0b',
                        border: '1px solid #f59e0b',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.backgroundColor = '#fef3c7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.backgroundColor = 'transparent';
                      }}
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        <p>Powered by MNEE Programmable Money • All transactions on Ethereum blockchain</p>
        <p style={{ marginTop: '0.5rem' }}>
          Contract: {contractAddresses.Commerce?.slice(0, 8)}...{contractAddresses.Commerce?.slice(-8)}
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}