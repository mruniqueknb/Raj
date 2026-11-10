import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage'
import NewBillPage from './pages/NewBillPage'
import ReceiptPage from './pages/ReceiptPage'
import SalesPage from './pages/SalesPage'
import CreditPage from './pages/CreditPage'
import ReportsPage from './pages/ReportsPage'
import {
  IconCredit,
  IconNewBill,
  IconProducts,
  IconReports,
  IconSales,
} from './components/Icons'

export default function App() {
  return (
    <div className="app-shell">
      {/* DESKTOP & TABLET TOPBAR */}
      <header className="topbar no-print">
        <div className="brand-group">
          <NavLink to="/" className="brand">
            <div className="brand-logo-icon">RP</div>
            <div className="brand-text">
              <strong>Raj Pipes & Electricals & Paints</strong>
              <span>1/483 Sathankulam Main Road, Megnanapuram - 628210</span>
            </div>
          </NavLink>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav desktop-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconProducts size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink to="/bills/new" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconNewBill size={18} />
            <span>New Bill</span>
          </NavLink>

          <NavLink to="/sales" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconSales size={18} />
            <span>Sales</span>
          </NavLink>

          <NavLink to="/credit" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconCredit size={18} />
            <span>Credit</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
            <IconReports size={18} />
            <span>Reports</span>
          </NavLink>
        </nav>
      </header>

      {/* MAIN CONTENT ROUTING */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/bills/new" element={<NewBillPage />} />
          <Route path="/bills/:id" element={<ReceiptPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/credit" element={<CreditPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on phones <= 768px) */}
      <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
        <NavLink to="/" end className={({ isActive }) => `m-nav-item ${isActive ? 'active' : ''}`}>
          <IconProducts size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink to="/bills/new" className={({ isActive }) => `m-nav-item highlight ${isActive ? 'active' : ''}`}>
          <IconNewBill size={20} />
          <span>New Bill</span>
        </NavLink>

        <NavLink to="/sales" className={({ isActive }) => `m-nav-item ${isActive ? 'active' : ''}`}>
          <IconSales size={20} />
          <span>Sales</span>
        </NavLink>

        <NavLink to="/credit" className={({ isActive }) => `m-nav-item ${isActive ? 'active' : ''}`}>
          <IconCredit size={20} />
          <span>Credit</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `m-nav-item ${isActive ? 'active' : ''}`}>
          <IconReports size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>
    </div>
  )
}
