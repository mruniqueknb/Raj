import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { DailySalesBarChart, DonutChart } from '../components/SalesCharts'
import { IconPrint, IconReports, IconTrendingUp } from '../components/Icons'

export default function ReportsPage() {
  const [days, setDays] = useState(30)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData(selectedDays) {
    setLoading(true)
    setError('')
    try {
      const data = await api.getSalesReport(selectedDays)
      setReport(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(days)
  }, [days])

  function handlePrint() {
    window.print()
  }

  const totalRevenue = report ? Number(report.totalPaidRevenue || 0) : 0
  const totalCredit = report ? Number(report.totalCreditAmount || 0) : 0
  const totalBilled = totalRevenue + totalCredit
  const collectionPct = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 0

  return (
    <section className="panel reports-page">
      {/* Page Header */}
      <div className="reports-header no-print">
        <div>
          <div className="title-with-icon">
            <span className="icon-badge">
              <IconReports size={22} />
            </span>
            <div>
              <h1>Sales Report & Analytics</h1>
              <p className="subtitle">Visual insights into shop sales, revenue trends, labour performance, and top products.</p>
            </div>
          </div>
        </div>

        <div className="reports-controls">
          <div className="filter-pill-group">
            {[
              { label: '7 Days', value: 7 },
              { label: '14 Days', value: 14 },
              { label: '30 Days', value: 30 },
              { label: '90 Days', value: 90 },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-pill ${days === opt.value ? 'active' : ''}`}
                onClick={() => setDays(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn secondary print-report-btn" onClick={handlePrint}>
            <IconPrint size={18} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (Visible only when printed) */}
      <div className="print-report-header only-print">
        <h2>RAJ PIPES & ELECTRICALS & PAINTS - SALES ANALYTICS REPORT</h2>
        <p>1/483 Sathankulam Main Road, Megnanapuram - 628210 | Period: Last {days} Days | Generated on: {new Date().toLocaleDateString('en-IN')}</p>
        <hr />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Generating sales report visualizations...</p>
        </div>
      ) : !report ? (
        <div className="empty-state">No report data found.</div>
      ) : (
        <div className="analytics-content">
          {/* KPI Stat Cards */}
          <div className="kpi-grid">
            <div className="kpi-card highlight-green">
              <div className="kpi-top">
                <span className="kpi-title">Total Paid Revenue</span>
                <span className="kpi-icon-pill green">₹</span>
              </div>
              <div className="kpi-value">
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="kpi-meta">
                <span>{report.paidBillsCount} paid invoices</span>
              </div>
            </div>

            <div className="kpi-card highlight-amber">
              <div className="kpi-top">
                <span className="kpi-title">Pending Credit</span>
                <span className="kpi-icon-pill amber">⏳</span>
              </div>
              <div className="kpi-value">
                ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="kpi-meta">
                <span>{report.creditBillsCount} unpaid credit bills</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Today's Sales</span>
                <span className="kpi-icon-pill blue">⚡</span>
              </div>
              <div className="kpi-value">
                ₹{Number(report.todaySales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="kpi-meta">
                <span>{report.todayBillsCount || 0} bills today</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">This Month Sales</span>
                <span className="kpi-icon-pill purple">📅</span>
              </div>
              <div className="kpi-value">
                ₹{Number(report.thisMonthSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="kpi-meta">
                <span>{report.thisMonthBillsCount || 0} bills this month</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Collection Rate</span>
                <span className="kpi-icon-pill green">
                  <IconTrendingUp size={16} />
                </span>
              </div>
              <div className="kpi-value">{collectionPct}%</div>
              <div className="kpi-meta">
                <span>Avg Bill: ₹{Number(report.avgBillAmount || 0).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Visualizations Grid */}
          <div className="charts-grid">
            {/* Chart 1: Daily Revenue Trend */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>Daily Sales & Credit Trend</h3>
                  <p className="card-subtext">Cash revenue vs credit additions for the selected period</p>
                </div>
              </div>
              <DailySalesBarChart data={report.dailySales} />
            </div>

            {/* Chart 2: Collection Ratio */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>Payment Status Split</h3>
                  <p className="card-subtext">Ratio of paid cash vs outstanding credit</p>
                </div>
              </div>
              <DonutChart paidAmount={totalRevenue} creditAmount={totalCredit} />
            </div>
          </div>

          {/* Leaderboards Grid */}
          <div className="leaderboards-grid">
            {/* Labour Sales Performance */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>Labour / Staff Performance</h3>
                  <p className="card-subtext">Sales generated by each labour or counter billing</p>
                </div>
              </div>

              <div className="leaderboard-list">
                {(!report.labourSales || report.labourSales.length === 0) ? (
                  <p className="empty-subtext">No labour sales recorded yet.</p>
                ) : (
                  report.labourSales.map((labour, idx) => {
                    const maxLabourRev = Math.max(...report.labourSales.map((l) => Number(l.revenue || 0)), 1)
                    const pct = Math.round((Number(labour.revenue || 0) / maxLabourRev) * 100)

                    return (
                      <div key={idx} className="leaderboard-item">
                        <div className="leaderboard-rank">{idx + 1}</div>
                        <div className="leaderboard-details">
                          <div className="leaderboard-title-row">
                            <strong>{labour.labourName}</strong>
                            <span className="leaderboard-amount">
                              ₹{Number(labour.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: '#10b981' }} />
                          </div>
                          <span className="leaderboard-sub">
                            {labour.billsCount} bill{labour.billsCount === 1 ? '' : 's'} created
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3>Top Selling Products</h3>
                  <p className="card-subtext">Most sold inventory items by revenue and volume</p>
                </div>
              </div>

              <div className="leaderboard-list">
                {(!report.topProducts || report.topProducts.length === 0) ? (
                  <p className="empty-subtext">No product sales recorded yet.</p>
                ) : (
                  report.topProducts.slice(0, 7).map((prod, idx) => {
                    const maxProdRev = Math.max(...report.topProducts.map((p) => Number(p.totalRevenue || 0)), 1)
                    const pct = Math.round((Number(prod.totalRevenue || 0) / maxProdRev) * 100)

                    return (
                      <div key={idx} className="leaderboard-item">
                        <div className="leaderboard-rank">{idx + 1}</div>
                        <div className="leaderboard-details">
                          <div className="leaderboard-title-row">
                            <strong>{prod.productName}</strong>
                            <span className="leaderboard-amount">
                              ₹{Number(prod.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: '#3b82f6' }} />
                          </div>
                          <span className="leaderboard-sub">
                            {prod.quantitySold} units sold
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
