const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let authToken: string | null = localStorage.getItem('token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const api = {
  auth: {
    signup: async (data: {
      email: string;
      password: string;
      role: 'farmer' | 'customer';
      full_name: string;
      farm_name?: string;
    }) => {
      const result = await fetchAPI('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setAuthToken(result.token);
      return result;
    },

    login: async (email: string, password: string) => {
      const result = await fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(result.token);
      return result;
    },

    logout: () => {
      setAuthToken(null);
    },

    getMe: () => fetchAPI('/api/auth/me'),
  },

  products: {
    getAll: () => fetchAPI('/api/products'),

    getById: (id: string) => fetchAPI(`/api/products/${id}`),

    create: (data: {
      name: string;
      description: string;
      quantity: number;
      price: number;
      prepared_date: string;
    }) =>
      fetchAPI('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: {
      name: string;
      description: string;
      quantity: number;
      price: number;
      prepared_date: string;
    }) =>
      fetchAPI(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/api/products/${id}`, {
        method: 'DELETE',
      }),
  },
};
