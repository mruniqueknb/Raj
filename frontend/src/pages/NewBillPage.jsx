import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { IconCheck, IconCredit, IconMinus, IconNewBill, IconPlus, IconTrash } from '../components/Icons'

export default function NewBillPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [labourName, setLabourName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [lines, setLines] = useState([{ productId: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .getProducts(true)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const productMap = useMemo(() => {
    const map = new Map()
    products.forEach((p) => map.set(String(p.id), p))
    return map
  }, [products])

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = productMap.get(String(line.productId))
      if (!product) return sum
      return sum + Number(product.price) * Number(line.quantity || 0)
    }, 0)
  }, [lines, productMap])

  function updateLine(index, field, value) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    )
  }

  function adjustQuantity(index, delta) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line
        const current = Number(line.quantity || 1)
        const next = Math.max(1, current + delta)
        return { ...line, quantity: next }
      })
    )
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: '', quantity: 1 }])
  }

  function removeLine(index) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function submit(status) {
    setError('')
    if (!labourName.trim()) {
      setError('Please enter the Labour / Billing staff name.')
      return
    }
    if (!customerName.trim()) {
      setError('Please enter the Customer name.')
      return
    }
    if (!customerPhone.trim()) {
      setError('Please enter the Customer phone number for WhatsApp receipts.')
      return
    }

    const items = lines
      .filter((line) => line.productId)
      .map((line) => ({
        productId: Number(line.productId),
        quantity: Math.max(1, Number(line.quantity)),
      }))

    if (items.length === 0) {
      setError('Please select at least one product for this bill.')
      return
    }

    // Check stock locally before sending
    for (const item of items) {
      const prod = productMap.get(String(item.productId))
      if (prod && prod.stockQty < item.quantity) {
        setError(`Insufficient stock for "${prod.name}" (Only ${prod.stockQty} in stock).`)
        return
      }
    }

    setSaving(true)
    try {
      const bill = await api.createBill({
        labourName: labourName.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        status,
        items,
      })
      navigate(`/bills/${bill.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel new-bill-page">
      {/* Header */}
      <div className="section-header">
        <div className="title-with-icon">
          <span className="icon-badge green">
            <IconNewBill size={22} />
          </span>
          <div>
            <h1>Create New Bill</h1>
            <p className="subtitle">Enter customer details, select products, and choose Paid or Credit.</p>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Customer & Labour Info Form */}
      <div className="bill-info-card">
        <h3>1. Billing Information</h3>
        <div className="grid-form">
          <label>
            <span className="field-label">Labour / Staff Name *</span>
            <input
              required
              value={labourName}
              onChange={(e) => setLabourName(e.target.value)}
              placeholder="e.g. Ramesh, Suresh..."
              className="form-input"
            />
          </label>
          <label>
            <span className="field-label">Customer Name *</span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Amit Kumar"
              className="form-input"
            />
          </label>
          <label>
            <span className="field-label">Customer Phone (WhatsApp) *</span>
            <input
              required
              type="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="form-input"
            />
          </label>
        </div>
      </div>

      {/* Items List */}
      <div className="bill-items-section">
        <div className="section-subtitle-row">
          <h3>2. Bill Items ({lines.length})</h3>
          <span className="subtitle-hint">Select items and adjust quantity</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading available products...</p>
          </div>
        ) : (
          <div className="items-list">
            {lines.map((line, index) => {
              const product = productMap.get(String(line.productId))
              const lineTotal = product
                ? Number(product.price) * Number(line.quantity || 0)
                : 0

              return (
                <div className="item-row-card" key={index}>
                  <div className="item-select-col">
                    <label>
                      <span className="field-label">Select Product</span>
                      <select
                        value={line.productId}
                        onChange={(e) => updateLine(index, 'productId', e.target.value)}
                        className="form-select"
                      >
                        <option value="">-- Choose item --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₹{Number(p.price).toFixed(2)} ({p.stockQty} {p.unit || 'pcs'} left)
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="item-qty-col">
                    <span className="field-label">Quantity</span>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => adjustQuantity(index, -1)}
                        disabled={Number(line.quantity) <= 1}
                        aria-label="Decrease quantity"
                      >
                        <IconMinus size={14} />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                        className="qty-input"
                      />
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => adjustQuantity(index, 1)}
                        aria-label="Increase quantity"
                      >
                        <IconPlus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="item-price-col">
                    <span className="field-label">Line Total</span>
                    <div className="line-total-display">
                      ₹{lineTotal.toFixed(2)}
                      {product && (
                        <span className="unit-hint">
                          (₹{Number(product.price).toFixed(0)}/{product.unit || 'pcs'})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="item-remove-col">
                    <button
                      type="button"
                      className="icon-delete-btn"
                      onClick={() => removeLine(index)}
                      title="Remove Item"
                      disabled={lines.length === 1 && !line.productId}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="add-item-bar">
          <button type="button" className="btn secondary add-line-btn" onClick={addLine}>
            <IconPlus size={16} />
            <span>Add Another Product</span>
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="bill-summary-card">
        <div className="summary-left">
          <span className="total-label">Grand Total:</span>
          <span className="grand-total-val">₹{total.toFixed(2)}</span>
        </div>

        <div className="bill-submit-actions">
          <button
            className="btn save-paid-btn"
            type="button"
            disabled={saving || total <= 0}
            onClick={() => submit('PAID')}
          >
            <IconCheck size={18} />
            <span>{saving ? 'Saving...' : 'Save as Paid'}</span>
          </button>

          <button
            className="btn credit save-credit-btn"
            type="button"
            disabled={saving || total <= 0}
            onClick={() => submit('CREDIT')}
          >
            <IconCredit size={18} />
            <span>{saving ? 'Saving...' : 'Save as Credit'}</span>
          </button>
        </div>
      </div>

      {/* STICKY MOBILE BOTTOM BAR (Visible on screens <= 768px) */}
      <div className="mobile-sticky-footer">
        <div className="mobile-footer-total">
          <span className="m-label">Total</span>
          <strong className="m-val">₹{total.toFixed(2)}</strong>
        </div>
        <div className="mobile-footer-buttons">
          <button
            className="btn btn-sm save-paid-btn"
            type="button"
            disabled={saving || total <= 0}
            onClick={() => submit('PAID')}
          >
            ✓ Paid
          </button>
          <button
            className="btn credit btn-sm save-credit-btn"
            type="button"
            disabled={saving || total <= 0}
            onClick={() => submit('CREDIT')}
          >
            ⏳ Credit
          </button>
        </div>
      </div>
    </section>
  )
}
