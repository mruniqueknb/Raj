import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { IconCheck, IconEdit, IconPlus, IconProducts, IconSearch, IconTrash } from '../components/Icons'

const emptyForm = {
  name: '',
  sku: '',
  unit: 'pcs',
  price: '',
  stockQty: '',
  active: true,
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState('all') // 'all', 'active', 'lowStock'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getProducts(false)
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      sku: product.sku || '',
      unit: product.unit || 'pcs',
      price: String(product.price),
      stockQty: String(product.stockQty),
      active: product.active,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const body = {
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      unit: form.unit.trim() || 'pcs',
      price: Number(form.price),
      stockQty: Number(form.stockQty),
      active: form.active,
    }
    try {
      if (editingId) {
        await api.updateProduct(editingId, body)
      } else {
        await api.createProduct(body)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Deactivate product "${name}"?`)) return
    setError('')
    try {
      await api.deleteProduct(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesName = p.name && p.name.toLowerCase().includes(q)
        const matchesSku = p.sku && p.sku.toLowerCase().includes(q)
        if (!matchesName && !matchesSku) return false
      }

      // Filter mode
      if (filterMode === 'active') return p.active
      if (filterMode === 'lowStock') return p.stockQty <= 10
      return true
    })
  }, [products, searchTerm, filterMode])

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.active).length
  const lowStockCount = products.filter((p) => p.stockQty <= 10).length

  return (
    <section className="panel products-page">
      {/* Header */}
      <div className="section-header">
        <div className="title-with-icon">
          <span className="icon-badge green">
            <IconProducts size={22} />
          </span>
          <div>
            <h1>Products & Inventory</h1>
            <p className="subtitle">Manage pipes, electricals, paints, sanitary items, prices, and stock units.</p>
          </div>
        </div>

        <button
          type="button"
          className={`btn ${showForm ? 'secondary' : ''}`}
          onClick={() => {
            if (showForm) resetForm()
            else setShowForm(true)
          }}
        >
          <IconPlus size={18} />
          <span>{showForm ? 'Close Form' : 'Add Product'}</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="sales-stats-row">
        <div className="sales-stat-item">
          <span className="stat-label">Total Inventory</span>
          <strong className="stat-val">{totalProducts} items</strong>
        </div>
        <div className="sales-stat-item">
          <span className="stat-label">Active For Billing</span>
          <strong className="stat-val green">{activeProducts}</strong>
        </div>
        <div className="sales-stat-item">
          <span className="stat-label">Low Stock (&le;10)</span>
          <strong className={`stat-val ${lowStockCount > 0 ? 'amber' : ''}`}>
            {lowStockCount}
          </strong>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      {showForm && (
        <div className="product-form-card">
          <div className="card-header-bar">
            <h3>{editingId ? 'Edit Product Details' : 'Add New Product to Store'}</h3>
            <button type="button" className="close-link" onClick={resetForm}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-form">
              <label>
                <span className="field-label">Product Name *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. PVC Pipe 1 inch (Heavy)"
                  className="form-input"
                />
              </label>

              <label>
                <span className="field-label">SKU / Code</span>
                <input
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="Optional barcode / SKU"
                  className="form-input"
                />
              </label>

              <label>
                <span className="field-label">Unit of Measure *</span>
                <select
                  value={form.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  className="form-select"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="m">Meters (m)</option>
                  <option value="feet">Feet (ft)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="bundle">Bundle</option>
                  <option value="box">Box</option>
                </select>
              </label>

              <label>
                <span className="field-label">Price per Unit (₹) *</span>
                <input
                  required
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                  className="form-input"
                />
              </label>

              <label>
                <span className="field-label">Current Stock Quantity *</span>
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={form.stockQty}
                  onChange={(e) => updateField('stockQty', e.target.value)}
                  placeholder="0"
                  className="form-input"
                />
              </label>

              {editingId && (
                <label>
                  <span className="field-label">Billing Status</span>
                  <select
                    value={form.active ? 'true' : 'false'}
                    onChange={(e) => updateField('active', e.target.value === 'true')}
                    className="form-select"
                  >
                    <option value="true">Active (Can Bill)</option>
                    <option value="false">Inactive (Hidden from Billing)</option>
                  </select>
                </label>
              )}
            </div>

            <div className="actions form-actions">
              <button className="btn" type="submit">
                <IconCheck size={18} />
                <span>{editingId ? 'Update Product' : 'Save Product'}</span>
              </button>
              <button className="btn secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="search-filter-bar">
        <div className="search-input-box">
          <IconSearch size={18} className="search-icon" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="search-input"
          />
          {searchTerm && (
            <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterMode === 'active' ? 'active' : ''}`}
            onClick={() => setFilterMode('active')}
          >
            Active ({activeProducts})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterMode === 'lowStock' ? 'active' : ''}`}
            onClick={() => setFilterMode('lowStock')}
          >
            Low Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Data display: Mobile Cards vs Desktop Table */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading product catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>{searchTerm ? 'No products match your search.' : 'No products found.'}</p>
          {!showForm && (
            <button className="btn" type="button" onClick={() => setShowForm(true)}>
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <>
          {/* MOBILE CARDS LIST */}
          <div className="mobile-cards-list">
            {filteredProducts.map((p) => {
              const isLow = p.stockQty <= 10
              const isOut = p.stockQty === 0

              return (
                <div key={p.id} className="mobile-record-card">
                  <div className="card-top-row">
                    <span className="cust-name">{p.name}</span>
                    <span className="card-amount">₹{Number(p.price).toFixed(2)}</span>
                  </div>

                  <div className="card-meta-row">
                    <span>
                      Unit: <strong>{p.unit}</strong> {p.sku && `· SKU: ${p.sku}`}
                    </span>
                    <span
                      className={`badge ${
                        isOut ? 'danger' : isLow ? 'credit' : 'paid'
                      }`}
                    >
                      Stock: {p.stockQty} {p.unit}
                    </span>
                  </div>

                  <div className="card-meta-row">
                    <span className={`badge ${p.active ? 'paid' : 'inactive'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="card-actions-row" style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="btn secondary card-action-btn"
                        onClick={() => startEdit(p)}
                      >
                        <IconEdit size={14} />
                        <span>Edit</span>
                      </button>
                      {p.active && (
                        <button
                          type="button"
                          className="btn danger card-action-btn"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* DESKTOP TABLE */}
          <div className="table-wrap desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Unit</th>
                  <th style={{ textAlign: 'right' }}>Price (₹)</th>
                  <th style={{ textAlign: 'center' }}>Stock Qty</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.stockQty <= 10
                  const isOut = p.stockQty === 0

                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td className="meta-time">{p.sku || '—'}</td>
                      <td>{p.unit}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>
                        ₹{Number(p.price).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            isOut ? 'danger' : isLow ? 'credit' : 'paid'
                          }`}
                        >
                          {p.stockQty} {p.unit}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.active ? 'paid' : 'inactive'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn secondary btn-sm"
                            onClick={() => startEdit(p)}
                          >
                            <IconEdit size={14} />
                            <span>Edit</span>
                          </button>
                          {p.active && (
                            <button
                              type="button"
                              className="btn danger btn-sm"
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Deactivate Product"
                            >
                              <IconTrash size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
