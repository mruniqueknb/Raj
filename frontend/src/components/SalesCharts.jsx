import React, { useState } from 'react'

export function DailySalesBarChart({ data = [] }) {
  const [activeIdx, setActiveIdx] = useState(null)

  if (!data || data.length === 0) {
    return <div className="chart-empty">No daily sales data recorded yet.</div>
  }

  // Filter out days if too many, or display up to last 14-30
  const chartData = data.slice(-14) // Display last 14 points nicely on mobile/desktop

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(Number(d.revenue || 0), Number(d.creditAmount || 0))),
    100
  )

  const chartHeight = 220
  const chartWidth = 560
  const paddingBottom = 30
  const paddingTop = 20
  const paddingLeft = 45
  const paddingRight = 15
  const plotWidth = chartWidth - paddingLeft - paddingRight
  const plotHeight = chartHeight - paddingTop - paddingBottom

  const barGroupWidth = plotWidth / chartData.length
  const barWidth = Math.max(Math.min(barGroupWidth * 0.35, 14), 6)

  // Y-axis tick intervals
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => Math.round(maxVal * pct))

  return (
    <div className="chart-container">
      {activeIdx !== null && chartData[activeIdx] && (
        <div className="chart-tooltip">
          <div className="tooltip-date">
            {new Date(chartData[activeIdx].date).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </div>
          <div className="tooltip-row paid">
            <span>Paid Sales:</span>
            <strong>₹{Number(chartData[activeIdx].revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          {Number(chartData[activeIdx].creditAmount || 0) > 0 && (
            <div className="tooltip-row credit">
              <span>Credit:</span>
              <strong>₹{Number(chartData[activeIdx].creditAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          )}
          <div className="tooltip-row count">
            <span>Bills:</span>
            <strong>{chartData[activeIdx].billsCount || 0}</strong>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart" preserveAspectRatio="xMidYMid meet">
        {/* Y Gridlines and labels */}
        {yTicks.map((tick, i) => {
          const y = paddingTop + plotHeight - (tick / maxVal) * plotHeight
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={i === 0 ? 'none' : '3 3'}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="inherit"
              >
                ₹{tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {chartData.map((d, idx) => {
          const groupX = paddingLeft + idx * barGroupWidth
          const paidVal = Number(d.revenue || 0)
          const creditVal = Number(d.creditAmount || 0)

          const paidHeight = (paidVal / maxVal) * plotHeight
          const creditHeight = (creditVal / maxVal) * plotHeight

          const paidY = paddingTop + plotHeight - paidHeight
          const creditY = paddingTop + plotHeight - creditHeight

          const isHovered = activeIdx === idx
          const dateLabel = new Date(d.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'numeric',
          })

          return (
            <g
              key={idx}
              className="bar-group"
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              onTouchStart={() => setActiveIdx(idx)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight column backdrop */}
              <rect
                x={groupX}
                y={paddingTop}
                width={barGroupWidth}
                height={plotHeight}
                fill={isHovered ? 'rgba(16, 185, 129, 0.08)' : 'transparent'}
                rx="4"
              />

              {/* Paid bar */}
              <rect
                x={groupX + barGroupWidth / 2 - barWidth - 1}
                y={paidY}
                width={barWidth}
                height={Math.max(paidHeight, 2)}
                fill="#10b981"
                rx="3"
                opacity={activeIdx !== null && !isHovered ? 0.45 : 1}
              />

              {/* Credit bar */}
              <rect
                x={groupX + barGroupWidth / 2 + 1}
                y={creditY}
                width={barWidth}
                height={Math.max(creditHeight, 2)}
                fill="#f59e0b"
                rx="3"
                opacity={activeIdx !== null && !isHovered ? 0.45 : 1}
              />

              {/* X Date Label */}
              <text
                x={groupX + barGroupWidth / 2}
                y={chartHeight - 10}
                fill={isHovered ? '#0f172a' : '#64748b'}
                fontWeight={isHovered ? '700' : '500'}
                fontSize="9.5"
                textAnchor="middle"
              >
                {dateLabel}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#10b981' }} />
          Paid Revenue
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#f59e0b' }} />
          Credit Added
        </span>
        <span className="legend-subtext">Tap or hover any day for details</span>
      </div>
    </div>
  )
}

export function DonutChart({ paidAmount = 0, creditAmount = 0 }) {
  const paid = Math.max(Number(paidAmount), 0)
  const credit = Math.max(Number(creditAmount), 0)
  const total = paid + credit

  if (total === 0) {
    return <div className="chart-empty">No sales transactions to display.</div>
  }

  const paidPct = Math.round((paid / total) * 100)
  const creditPct = 100 - paidPct

  const size = 160
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const paidStrokeDash = (paidPct / 100) * circumference
  const creditStrokeDash = circumference - paidStrokeDash

  return (
    <div className="donut-wrapper">
      <div className="donut-svg-box">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Credit arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset="0"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Paid arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${paidStrokeDash} ${circumference}`}
            strokeDashoffset="0"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="donut-center-label">
          <span className="center-pct">{paidPct}%</span>
          <span className="center-text">Collected</span>
        </div>
      </div>

      <div className="donut-stats-list">
        <div className="donut-stat-row">
          <div className="dot-and-label">
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>Cash / Paid</span>
          </div>
          <strong>₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({paidPct}%)</strong>
        </div>
        <div className="donut-stat-row">
          <div className="dot-and-label">
            <span className="legend-dot" style={{ background: '#f59e0b' }} />
            <span>Pending Credit</span>
          </div>
          <strong style={{ color: '#b45309' }}>₹{credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({creditPct}%)</strong>
        </div>
        <div className="donut-stat-row total">
          <span>Total Billed</span>
          <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  )
}
