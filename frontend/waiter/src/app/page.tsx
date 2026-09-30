'use client';

import { useState } from 'react';

type Tab = 'tables' | 'alerts' | 'orders';

interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'occupied' | 'available' | 'bill_requested' | 'attention';
  guestCount: number;
  activeOrderId?: string;
}

interface AlertItem {
  id: string;
  tableNumber: string;
  type: 'call_waiter' | 'request_bill' | 'need_help';
  time: string;
  status: 'pending' | 'acknowledged';
}

interface OrderItem {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: string[];
  status: 'ready_for_pickup' | 'cooking' | 'served';
  total: string;
}

const mockTables: TableItem[] = [
  { id: '1', tableNumber: 'T-04', capacity: 4, status: 'attention', guestCount: 3, activeOrderId: 'ORD-8902' },
  { id: '2', tableNumber: 'T-05', capacity: 2, status: 'occupied', guestCount: 2, activeOrderId: 'ORD-8903' },
  { id: '3', tableNumber: 'T-06', capacity: 6, status: 'bill_requested', guestCount: 5, activeOrderId: 'ORD-8898' },
  { id: '4', tableNumber: 'T-08', capacity: 4, status: 'available', guestCount: 0 },
  { id: '5', tableNumber: 'T-11', capacity: 2, status: 'occupied', guestCount: 2, activeOrderId: 'ORD-8905' },
];

const mockAlerts: AlertItem[] = [
  { id: 'a1', tableNumber: 'T-04', type: 'call_waiter', time: '1 min ago', status: 'pending' },
  { id: 'a2', tableNumber: 'T-06', type: 'request_bill', time: '3 mins ago', status: 'pending' },
  { id: 'a3', tableNumber: 'T-05', type: 'need_help', time: '5 mins ago', status: 'acknowledged' },
];

const mockOrders: OrderItem[] = [
  { id: 'o1', orderNumber: '#8902', tableNumber: 'T-04', items: ['2x Wagyu Burger', '1x Truffle Fries'], status: 'ready_for_pickup', total: '£42.50' },
  { id: 'o2', orderNumber: '#8903', tableNumber: 'T-05', items: ['1x Caesar Salad', '1x Pinot Grigio'], status: 'cooking', total: '£28.00' },
  { id: 'o3', orderNumber: '#8905', tableNumber: 'T-11', items: ['2x Ribeye Steak', '2x Red Wine'], status: 'cooking', total: '£76.00' },
  { id: 'o4', orderNumber: '#8898', tableNumber: 'T-06', items: ['4x Margherita Pizza', '4x Gelato'], status: 'served', total: '£64.00' },
];

export default function WaiterDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('tables');
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders);

  const resolveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const markOrderServed = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'served' } : o))
    );
  };

  return (
    <div className="waiter-container">
      <header className="waiter-header">
        <div className="brand-section">
          <span className="brand-badge">WAITER</span>
          <div>
            <h1 className="brand-title">Floor Operations Hub</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Branch: Central London • Station A
            </p>
          </div>
        </div>
        <div className="waiter-profile-badge">
          <span className="online-dot" />
          <span>Active Shift: <strong>Alex M.</strong></span>
        </div>
      </header>

      {/* Overview Metric Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">My Assigned Tables</span>
          <span className="stat-value">{mockTables.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Guest Calls</span>
          <span className="stat-value" style={{ color: alerts.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {alerts.length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Orders Ready for Pickup</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>
            {orders.filter((o) => o.status === 'ready_for_pickup').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Shift Status</span>
          <span className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--success)', marginTop: '0.5rem' }}>
            ON DUTY
          </span>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          Assigned Tables ({mockTables.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Table Alerts ({alerts.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Live Orders ({orders.length})
        </button>
      </nav>

      {/* Tab Contents */}
      {activeTab === 'tables' && (
        <section>
          <h2 className="section-title">Assigned Station Tables</h2>
          <div className="grid-cards">
            {mockTables.map((t) => (
              <div key={t.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{t.tableNumber}</h3>
                  <span
                    className={`card-tag ${
                      t.status === 'attention'
                        ? 'tag-urgent'
                        : t.status === 'bill_requested'
                        ? 'tag-warning'
                        : t.status === 'occupied'
                        ? 'tag-info'
                        : 'tag-success'
                    }`}
                  >
                    {t.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="card-body">
                  <p>Capacity: {t.capacity} seats</p>
                  <p>Current Guests: {t.guestCount}</p>
                  {t.activeOrderId && <p>Order Ref: <strong>{t.activeOrderId}</strong></p>}
                </div>
                <button className="action-btn primary">Manage Table</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'alerts' && (
        <section>
          <h2 className="section-title">Customer Service Calls</h2>
          {alerts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>No active customer calls right now.</p>
          ) : (
            <div className="grid-cards">
              {alerts.map((a) => (
                <div key={a.id} className="card">
                  <div className="card-header">
                    <h3 className="card-title">Table {a.tableNumber}</h3>
                    <span className="card-tag tag-urgent">
                      {a.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>Triggered: {a.time}</p>
                    <p>Status: {a.status}</p>
                  </div>
                  <button
                    className="action-btn success"
                    onClick={() => resolveAlert(a.id)}
                  >
                    Resolve Alert
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'orders' && (
        <section>
          <h2 className="section-title">Kitchen Order Tracking</h2>
          <div className="grid-cards">
            {orders.map((o) => (
              <div key={o.id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{o.orderNumber}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Table: {o.tableNumber}
                    </span>
                  </div>
                  <span
                    className={`card-tag ${
                      o.status === 'ready_for_pickup'
                        ? 'tag-urgent'
                        : o.status === 'cooking'
                        ? 'tag-warning'
                        : 'tag-success'
                    }`}
                  >
                    {o.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="card-body">
                  <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>
                    {o.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p>Bill Total: <strong>{o.total}</strong></p>
                </div>
                {o.status === 'ready_for_pickup' ? (
                  <button
                    className="action-btn success"
                    onClick={() => markOrderServed(o.id)}
                  >
                    Mark as Served
                  </button>
                ) : (
                  <button className="action-btn" disabled>
                    {o.status === 'cooking' ? 'Preparing in Kitchen...' : 'Completed'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
