import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { IconNewBill, IconPrint, IconSales, IconSearch, IconWhatsApp } from '../components/Icons'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SalesPage() {
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .getBills('PAID')
      .then(setBills)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredBills = useMemo(() => {
    if (!searchTerm.trim()) return bills
    const q = searchTerm.toLowerCase().trim()
    return bills.filter(
      (b) =>
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)) ||
        (b.billNumber && b.billNumber.toLowerCase().includes(q)) ||
        (b.labourName && b.labourName.toLowerCase().includes(q))
    )
  }, [bills, searchTerm])

  const totalRevenue = useMemo(() => {
    return bills.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
  }, [bills])

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toDateString()
    return bills
      .filter((b) => new Date(b.paidAt || b.createdAt).toDateString() === todayStr)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
  }, [bills])

  async function openWhatsApp(id) {
    try {
      const link = await api.getWhatsAppLink(id)
      window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <section className="panel sales-page">
      {/* Header */}
      <div className="section-header">
        <div className="title-with-icon">
          <span className="icon-badge green">
            <IconSales size={22} />
          </span>
          <div>
            <h1>Sales Records</h1>
            <p className="subtitle">Paid bills recorded for the shop. Print, share, or inspect receipts.</p>
          </div>
        </div>

        <Link to="/bills/new" className="btn create-bill-btn">
          <IconNewBill size={18} />
          <span>New Bill</span>
        </Link>
      </div>

      {/* Quick KPI stats */}
      <div className="sales-stats-row">
        <div className="sales-stat-item">
          <span className="stat-label">Total Paid Sales</span>
          <strong className="stat-val green">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="sales-stat-item">
          <span className="stat-label">Paid Invoices</span>
          <strong className="stat-val">{bills.length}</strong>
        </div>
        <div className="sales-stat-item">
          <span className="stat-label">Today's Paid</span>
          <strong className="stat-val highlight">
            ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-input-box">
          <IconSearch size={18} className="search-icon" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, phone, labour, or bill #..."
            className="search-input"
          />
          {searchTerm && (
            <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <span className="search-count">
            Found {filteredBills.length} of {bills.length}
          </span>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Data presentation: Responsive Cards on Phone & Table on Desktop */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading sales records...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? 'No sales match your search query.' : 'No paid bills recorded yet.'}</p>
          <Link to="/bills/new" className="btn secondary">
            Create First Bill
          </Link>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (Only visible on screens <= 768px) */}
          <div className="mobile-cards-list">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="mobile-record-card">
                <div className="card-top-row">
                  <span className="badge paid">{bill.billNumber}</span>
                  <span className="card-amount">₹{Number(bill.totalAmount).toFixed(2)}</span>
                </div>

                <div className="card-customer-info">
                  <strong className="cust-name">{bill.customerName}</strong>
                  {bill.customerPhone && (
                    <a href={`tel:${bill.customerPhone}`} className="cust-phone-link">
                      📞 {bill.customerPhone}
                    </a>
                  )}
                </div>

                <div className="card-meta-row">
                  <span>Labour: <strong>{bill.labourName || '—'}</strong></span>
                  <span className="meta-time">{formatDate(bill.paidAt || bill.createdAt)}</span>
                </div>

                <div className="card-actions-row">
                  <Link to={`/bills/${bill.id}`} className="btn secondary card-action-btn">
                    Receipt
                  </Link>
                  <button
                    type="button"
                    className="btn secondary card-action-btn"
                    onClick={() => navigate(`/bills/${bill.id}`)}
                    title="Print Bill"
                  >
                    <IconPrint size={15} />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    className="btn secondary card-action-btn whatsapp-action"
                    onClick={() => openWhatsApp(bill.id)}
                    title="Send WhatsApp"
                  >
                    <IconWhatsApp size={15} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW (Visible on screens > 768px) */}
          <div className="table-wrap desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Labour</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th>Paid At</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span className="badge paid">{bill.billNumber}</span>
                    </td>
                    <td>
                      <strong>{bill.customerName}</strong>
                    </td>
                    <td>
                      <a href={`tel:${bill.customerPhone}`} className="tel-link">
                        {bill.customerPhone}
                      </a>
                    </td>
                    <td>{bill.labourName}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#047857' }}>
                      ₹{Number(bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="meta-time">{formatDate(bill.paidAt || bill.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="btn secondary btn-sm" to={`/bills/${bill.id}`}>
                          Receipt
                        </Link>
                        <button
                          type="button"
                          className="btn secondary btn-sm"
                          onClick={() => navigate(`/bills/${bill.id}`)}
                          title="Print Bill"
                        >
                          <IconPrint size={14} />
                          <span>Print</span>
                        </button>
                        <button
                          type="button"
                          className="btn secondary btn-sm whatsapp"
                          onClick={() => openWhatsApp(bill.id)}
                          title="WhatsApp Receipt"
                        >
                          <IconWhatsApp size={14} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
