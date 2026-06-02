const API_BASE = 'http://localhost:3001';

export const api = {
  // Helper
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Помилка запиту');
    }

    return response.json();
  },

  // Auth
  auth: {
    login: (data: any) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Transactions
  transactions: {
    getAll: () => api.request('/transactions'),
    create: (data: any) => api.request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/transactions/${id}`, { method: 'DELETE' }),
  },

  // Budgets
  budgets: {
    getAll: () => api.request('/budgets'),
    create: (data: any) => api.request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/budgets/${id}`, { method: 'DELETE' }),
  },

  // Debts
  debts: {
    getAll: () => api.request('/debts'),
    create: (data: any) => api.request('/debts', { method: 'POST', body: JSON.stringify(data) }),
    addPayment: (id: number, amount: number) => 
      api.request(`/debts/${id}/payment`, { method: 'PATCH', body: JSON.stringify({ amount }) }),
    delete: (id: number) => api.request(`/debts/${id}`, { method: 'DELETE' }),
  },

  // Goals
  goals: {
    getAll: () => api.request('/goals'),
    create: (data: any) => api.request('/goals', { method: 'POST', body: JSON.stringify(data) }),
    addContribution: (id: number, amount: number) => 
      api.request(`/goals/${id}/contribution`, { method: 'PATCH', body: JSON.stringify({ amount }) }),
    delete: (id: number) => api.request(`/goals/${id}`, { method: 'DELETE' }),
  },

  // Recurring
  recurring: {
    getAll: () => api.request('/recurring'),
    create: (data: any) => api.request('/recurring', { method: 'POST', body: JSON.stringify(data) }),
    toggle: (id: number) => api.request(`/recurring/${id}/toggle`, { method: 'PATCH' }),
    delete: (id: number) => api.request(`/recurring/${id}`, { method: 'DELETE' }),
  },

  mono: {
    getClientInfo: (token: string) => 
      fetch('https://api.monobank.ua/personal/client-info', {
        headers: { 'X-Token': token }
      }).then(res => res.json()),

    getStatement: (token: string, accountId: string, from: number, to: number) =>
      fetch(`https://api.monobank.ua/personal/statement/${accountId}/${from}/${to}`, {
        headers: { 'X-Token': token }
      }).then(res => res.json()),
  },
};