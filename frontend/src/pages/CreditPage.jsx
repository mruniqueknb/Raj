import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { IconCheck, IconCredit, IconPrint, IconSearch, IconWhatsApp } from '../components/Icons'

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

export default function CreditPage() {
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getBills('CREDIT')
      setBills(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
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

  const totalOutstanding = useMemo(() => {
    return bills.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
  }, [bills])

  async function markPaid(id, billNumber) {
    if (!window.confirm(`Mark bill ${billNumber} as PAID? It will be moved to Sales.`)) {
      return
    }
    setError('')
    setMessage('')
    try {
      await api.markPaid(id)
      setMessage(`Bill ${billNumber} successfully marked as PAID!`)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function openWhatsApp(id) {
    setError('')
    try {
      const link = await api.getWhatsAppLink(id)
      window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="panel credit-page">
      {/* Header */}
      <div className="section-header">
        <div className="title-with-icon">
          <span className="icon-badge amber">
            <IconCredit size={22} />
          </span>
          <div>
            <h1>Credit Ledger (Khata)</h1>
            <p className="subtitle">Pending bills awaiting payment. Mark paid once collected or send WhatsApp reminders.</p>
          </div>
        </div>

        <Link to="/bills/new" className="btn create-bill-btn">
          <span>+ New Credit Bill</span>
        </Link>
      </div>

      {/* Quick KPI stats */}
      <div className="sales-stats-row">
        <div className="sales-stat-item">
          <span className="stat-label">Total Outstanding Credit</span>
          <strong className="stat-val amber">
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="sales-stat-item">
          <span className="stat-label">Pending Invoices</span>
          <strong className="stat-val">{bills.length}</strong>
        </div>
        <div className="sales-stat-item">
          <span className="stat-label">Avg Pending Bill</span>
          <strong className="stat-val">
            ₹{bills.length > 0 ? (totalOutstanding / bills.length).toFixed(0) : '0'}
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
            placeholder="Search pending customer, phone, labour, or bill #..."
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

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {/* Data List */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading credit bills...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? 'No pending credit bills match your search.' : '🎉 No pending credit! All accounts are settled.'}</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW */}
          <div className="mobile-cards-list">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="mobile-record-card highlight-amber">
                <div className="card-top-row">
                  <span className="badge credit">{bill.billNumber}</span>
                  <span className="card-amount amber">₹{Number(bill.totalAmount).toFixed(2)}</span>
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
                  <span className="meta-time">{formatDate(bill.createdAt)}</span>
                </div>

                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn credit card-action-btn"
                    onClick={() => markPaid(bill.id, bill.billNumber)}
                  >
                    <IconCheck size={16} />
                    <span>Mark Paid</span>
                  </button>
                  <button
                    type="button"
                    className="btn secondary card-action-btn whatsapp-action"
                    onClick={() => openWhatsApp(bill.id)}
                    title="Send WhatsApp Reminder"
                  >
                    <IconWhatsApp size={16} />
                    <span>Reminder</span>
                  </button>
                  <button
                    type="button"
                    className="btn secondary card-action-btn"
                    onClick={() => navigate(`/bills/${bill.id}`)}
                    title="Print Bill"
                  >
                    <IconPrint size={16} />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="table-wrap desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Labour</th>
                  <th style={{ textAlign: 'right' }}>Pending Amount</th>
                  <th>Billed Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span className="badge credit">{bill.billNumber}</span>
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
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#b45309' }}>
                      ₹{Number(bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="meta-time">{formatDate(bill.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn credit btn-sm"
                          onClick={() => markPaid(bill.id, bill.billNumber)}
                        >
                          <IconCheck size={14} />
                          <span>Mark Paid</span>
                        </button>
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
                          title="WhatsApp Reminder"
                        >
                          <IconWhatsApp size={14} />
                          <span>WhatsApp</span>
                        </button>
                        <Link className="btn secondary btn-sm" to={`/bills/${bill.id}`}>
                          Receipt
                        </Link>
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
