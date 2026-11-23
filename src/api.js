const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `Request failed (${response.status}).`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const employeeApi = {
  list: ({ search = '', status = '' } = {}) => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (status) query.set('status', status);
    const suffix = query.size ? `?${query.toString()}` : '';
    return request(`/employees${suffix}`);
  },
  create: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
};
