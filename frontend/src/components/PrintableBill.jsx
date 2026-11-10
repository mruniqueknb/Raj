import React, { useState } from 'react'
import { IconPrint, IconWhatsApp, IconCheck } from './Icons'

// Helper to convert number to words (Indian numbering system)
function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only'
  if (!num || isNaN(num)) return ''

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const n = Math.floor(num)
  const paise = Math.round((num - n) * 100)

  function convertTwoDigits(v) {
    if (v < 20) return a[v]
    return b[Math.floor(v / 10)] + (v % 10 !== 0 ? ' ' + a[v % 10] : '')
  }

  function inWords(v) {
    let str = ''
    if (v >= 10000000) {
      str += inWords(Math.floor(v / 10000000)) + ' Crore '
      v %= 10000000
    }
    if (v >= 100000) {
      str += inWords(Math.floor(v / 100000)) + ' Lakh '
      v %= 100000
    }
    if (v >= 1000) {
      str += inWords(Math.floor(v / 1000)) + ' Thousand '
      v %= 1000
    }
    if (v >= 100) {
      str += inWords(Math.floor(v / 100)) + ' Hundred '
      v %= 100
    }
    if (v > 0) {
      str += convertTwoDigits(v) + ' '
    }
    return str.trim()
  }

  let words = inWords(n) + ' Rupees'
  if (paise > 0) {
    words += ' and ' + convertTwoDigits(paise) + ' Paise'
  }
  return words + ' Only'
}

export default function PrintableBill({ bill, onMarkPaid, onOpenWhatsApp }) {
  const [format, setFormat] = useState('standard') // 'standard' or 'thermal'

  if (!bill) return null

  const items = bill.items || []
  const billTotal = Number(bill.totalAmount || 0)
  const isPaid = bill.status === 'PAID'
  const dateStr = bill.createdAt ? new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : ''
  const timeStr = bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  }) : ''

  function handlePrint() {
    window.print()
  }

  return (
    <div className="printable-bill-wrapper">
      {/* Print Controls (Hidden when printing via @media print) */}
      <div className="bill-toolbar no-print">
        <div className="format-toggle">
          <span className="toggle-label">Bill Format:</span>
          <button
            type="button"
            className={`btn-toggle ${format === 'standard' ? 'active' : ''}`}
            onClick={() => setFormat('standard')}
          >
            A4 Standard Invoice
          </button>
          <button
            type="button"
            className={`btn-toggle ${format === 'thermal' ? 'active' : ''}`}
            onClick={() => setFormat('thermal')}
          >
            Thermal Slip (80mm)
          </button>
        </div>

        <div className="action-buttons">
          <button type="button" className="btn print-btn" onClick={handlePrint}>
            <IconPrint size={18} />
            <span>Print Bill</span>
          </button>
          {onOpenWhatsApp && (
            <button type="button" className="btn secondary whatsapp-btn" onClick={onOpenWhatsApp}>
              <IconWhatsApp size={18} />
              <span>WhatsApp</span>
            </button>
          )}
          {!isPaid && onMarkPaid && (
            <button type="button" className="btn credit" onClick={onMarkPaid}>
              <IconCheck size={18} />
              <span>Mark Paid</span>
            </button>
          )}
        </div>
      </div>

      {/* Bill Container */}
      <div className={`bill-sheet ${format === 'thermal' ? 'thermal-slip' : 'standard-invoice'}`}>
        {format === 'standard' ? (
          /* STANDARD A4 INVOICE */
          <div className="invoice-container">
            {/* Header */}
            <div className="invoice-header">
              <div className="company-info">
                <h1 className="company-name">RAJ PIPES & ELECTRICALS & PAINTS</h1>
                <p className="company-tagline">Pipes, Electricals, Paints</p>
                <p className="company-address">1/483 Sathankulam Main Road, Megnanapuram - 628210</p>
                <p className="company-phone">Phone : 04639-227349</p>
              </div>
              <div className="invoice-meta-badge">
                <div className="bill-title-box">
                  <span className="meta-doc-type">RETAIL INVOICE</span>
                  <span className="meta-bill-no">{bill.billNumber}</span>
                </div>
                <div className={`stamp ${isPaid ? 'stamp-paid' : 'stamp-credit'}`}>
                  {isPaid ? 'PAID' : 'CREDIT'}
                </div>
              </div>
            </div>

            <div className="divider-line" />

            {/* Billing Details Row */}
            <div className="invoice-details-grid">
              <div className="detail-col">
                <span className="col-label">CUSTOMER DETAILS</span>
                <strong className="customer-name">{bill.customerName || 'Walk-in Customer'}</strong>
                <p className="customer-phone">Phone: {bill.customerPhone || '—'}</p>
              </div>
              <div className="detail-col">
                <span className="col-label">INVOICE DETAILS</span>
                <p><strong>Date:</strong> {dateStr}</p>
                <p><strong>Time:</strong> {timeStr}</p>
                <p><strong>Billed By (Labour):</strong> {bill.labourName || 'Shop Counter'}</p>
              </div>
              <div className="detail-col">
                <span className="col-label">PAYMENT STATUS</span>
                <p>
                  <strong>Status: </strong>
                  <span className={`status-pill ${isPaid ? 'paid' : 'credit'}`}>
                    {bill.status}
                  </span>
                </p>
                {bill.paidAt && (
                  <p className="paid-date-note">
                    Paid on: {new Date(bill.paidAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="invoice-table-wrap">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Item Description</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Unit</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        No itemized records available.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{item.productName}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'center' }}>{item.unit || 'pcs'}</td>
                        <td style={{ textAlign: 'right' }}>
                          ₹{Number(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          ₹{Number(item.lineTotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="invoice-summary-grid">
              <div className="amount-words-box">
                <span className="words-title">Amount in Words:</span>
                <p className="words-text">{numberToWords(billTotal)}</p>
                <div className="terms-box">
                  <strong>Terms & Conditions:</strong>
                  <ol>
                    <li>Goods once sold will not be exchanged or returned without bill.</li>
                    <li>All disputes subject to Sathankulam / Megnanapuram jurisdiction.</li>
                  </ol>
                </div>
              </div>

              <div className="totals-calc-box">
                <div className="calc-row">
                  <span>Subtotal:</span>
                  <span>₹{billTotal.toFixed(2)}</span>
                </div>
                <div className="calc-row">
                  <span>Tax / GST:</span>
                  <span>₹0.00</span>
                </div>
                <div className="calc-row grand-total">
                  <span>Grand Total:</span>
                  <span className="grand-amount">₹{billTotal.toFixed(2)}</span>
                </div>
                <div className="payment-mode-note">
                  Payment Mode: <strong>{isPaid ? 'Cash / UPI (Received)' : 'Pending Credit'}</strong>
                </div>
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="invoice-signatures">
              <div className="sig-block">
                <div className="sig-line" />
                <span>Customer's Signature</span>
              </div>
              <div className="sig-block">
                <div className="sig-line" />
                <span>For Raj Pipes & Electricals & Paints (Authorized Signatory)</span>
              </div>
            </div>

            <div className="invoice-footer-message">
              <p>*** Thank You For Your Business! Visit Again! ***</p>
            </div>
          </div>
        ) : (
          /* THERMAL POS SLIP (80mm) */
          <div className="thermal-container">
            <div className="thermal-header">
              <h2>RAJ PIPES & ELECTRICALS & PAINTS</h2>
              <p>1/483 Sathankulam Main Road, Megnanapuram - 628210</p>
              <p>Tel: 04639-227349</p>
              <div className="dashed-separator" />
              <div className="thermal-meta">
                <p><strong>BILL #:</strong> {bill.billNumber}</p>
                <p><strong>DATE:</strong> {dateStr} {timeStr}</p>
                <p><strong>CUST:</strong> {bill.customerName} ({bill.customerPhone})</p>
                <p><strong>LABOUR:</strong> {bill.labourName || 'Counter'}</p>
              </div>
              <div className="dashed-separator" />
            </div>

            <table className="thermal-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>ITEM</th>
                  <th style={{ textAlign: 'center' }}>QTY</th>
                  <th style={{ textAlign: 'right' }}>RATE</th>
                  <th style={{ textAlign: 'right' }}>AMT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left' }}>{item.productName}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{Number(item.unitPrice).toFixed(0)}</td>
                    <td style={{ textAlign: 'right' }}>{Number(item.lineTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="dashed-separator" />

            <div className="thermal-total">
              <div className="thermal-row bold">
                <span>TOTAL AMOUNT:</span>
                <span>₹{billTotal.toFixed(2)}</span>
              </div>
              <div className="thermal-row">
                <span>STATUS:</span>
                <span>{isPaid ? 'PAID' : 'PENDING CREDIT'}</span>
              </div>
            </div>

            <div className="dashed-separator" />
            <div className="thermal-footer">
              <p>{numberToWords(billTotal)}</p>
              <p>Goods once sold are not returnable</p>
              <p>~ THANK YOU! VISIT AGAIN ~</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
