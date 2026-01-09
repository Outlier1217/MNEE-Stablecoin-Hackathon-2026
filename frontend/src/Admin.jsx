// src/Admin.jsx
import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const url = search
        ? `http://localhost:4000/admin/orders?buyer=${search}`
        : `http://localhost:4000/admin/orders`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error("ADMIN FETCH ERROR", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [search]);

  const total = orders.reduce((s, o) => s + Number(o.amount || 0), 0);
  const uniqueBuyers = new Set(orders.map(o => o.buyer_address)).size;
  const refundedCount = orders.filter(o => o.refunded).length;

  return (
    <div className="container">
      {/* Admin Header */}
      <div className="admin-header">
        <h1 className="text-gradient">Admin Dashboard</h1>
        <p>Monitor all transactions and manage orders</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="card stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{total.toFixed(2)}</div>
          <div className="stat-label">Total MNEE</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{uniqueBuyers}</div>
          <div className="stat-label">Unique Buyers</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{refundedCount}</div>
          <div className="stat-label">Refunded</div>
        </div>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by buyer address..."
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="empty-state">
          <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"></circle>
            <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10 10 10 0 01-10-10 10 10 0 0110-10" stroke="currentColor" strokeLinecap="round"></path>
          </svg>
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No orders found{search ? ` for "${search}"` : ""}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Transaction</th>
                <th>Block</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.tx_hash}>
                  <td>
                    <div style={{ fontFamily: "'Monaco', 'Courier New', monospace", fontSize: "0.875rem" }}>
                      {o.buyer_address?.slice(0, 8)}...{o.buyer_address?.slice(-6)}
                    </div>
                  </td>
                  <td>{o.product_name || "-"}</td>
                  <td>
                    <strong>{o.amount}</strong> MNEE
                  </td>
                  <td>
                    <div style={{ fontFamily: "'Monaco', 'Courier New', monospace", fontSize: "0.75rem" }}>
                      {o.tx_hash?.slice(0, 8)}...{o.tx_hash?.slice(-8)}
                    </div>
                  </td>
                  <td>{o.block_number}</td>
                  <td>{new Date(o.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`order-status ${o.refunded ? 'status-refunded' : 'status-completed'}`}>
                      {o.refunded ? 'Refunded' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Summary */}
      {!loading && orders.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Summary</h3>
              <p>Showing {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary)' }}>
                {total.toFixed(2)} MNEE
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Total Value
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}