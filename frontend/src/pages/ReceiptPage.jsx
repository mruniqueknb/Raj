import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import PrintableBill from '../components/PrintableBill'
import { IconNewBill } from '../components/Icons'

export default function ReceiptPage() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getBill(id)
      setBill(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function openWhatsApp() {
    setError('')
    try {
      const link = bill.whatsappLink || (await api.getWhatsAppLink(id)).url
      window.open(link, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.message)
    }
  }

  async function markPaid() {
    setError('')
    setMessage('')
    try {
      const updated = await api.markPaid(id)
      setBill(updated)
      setMessage('Bill marked as paid and moved to sales.')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading invoice details...</p>
        </div>
      </section>
    )
  }

  if (!bill) {
    return (
      <section className="panel">
        <p className="error">{error || 'Bill not found'}</p>
        <Link className="btn secondary" to="/bills/new">
          Back to New Bill
        </Link>
      </section>
    )
  }

  return (
    <section className="receipt-view-wrapper">
      {message && <div className="success-banner no-print">{message}</div>}
      {error && <div className="error-banner no-print">{error}</div>}

      {/* Navigation breadcrumb bar */}
      <div className="receipt-nav-bar no-print">
        <Link to={bill.status === 'CREDIT' ? '/credit' : '/sales'} className="btn secondary text-btn">
          ← Back to {bill.status === 'CREDIT' ? 'Credit' : 'Sales'}
        </Link>
        <Link to="/bills/new" className="btn secondary text-btn">
          <IconNewBill size={16} />
          <span>New Bill</span>
        </Link>
      </div>

      {/* Professional Printable Bill with A4 / Thermal mode & Print Options */}
      <PrintableBill
        bill={bill}
        onMarkPaid={bill.status === 'CREDIT' ? markPaid : null}
        onOpenWhatsApp={openWhatsApp}
      />
    </section>
  )
}
