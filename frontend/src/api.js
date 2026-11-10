const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  getProducts: (activeOnly = false) =>
    request(`/products?activeOnly=${activeOnly}`),
  createProduct: (body) =>
    request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) =>
    request(`/products/${id}`, { method: 'DELETE' }),

  createBill: (body) =>
    request('/bills', { method: 'POST', body: JSON.stringify(body) }),
  getBills: (status) =>
    request(status ? `/bills?status=${status}` : '/bills'),
  getBill: (id) => request(`/bills/${id}`),
  markPaid: (id) =>
    request(`/bills/${id}/mark-paid`, { method: 'POST' }),
  getWhatsAppLink: (id) => request(`/bills/${id}/whatsapp-link`),
  getSalesReport: (days = 30) =>
    request(`/reports/sales?days=${days}`),
};
