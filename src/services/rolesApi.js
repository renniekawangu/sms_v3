// Role Management API Service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user).token;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      if (response.status === 401) {
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    }

    return {};
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

export const rolesApi = {
  // Get all roles
  list: async () => {
    return apiCall('/roles', { method: 'GET' });
  },

  // Get single role by id or name
  get: async (roleId) => {
    if (!roleId) throw new Error('Role id is required');
    return apiCall(`/roles/${roleId}`, { method: 'GET' });
  },

  // Create new role
  create: async (data) => {
    return apiCall('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update role
  update: async (roleId, data) => {
    if (!roleId) throw new Error('Role id is required');
    return apiCall(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete role
  delete: async (roleId) => {
    if (!roleId) throw new Error('Role id is required');
    return apiCall(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  },

  // Get role permissions
  getPermissions: async (roleId) => {
    if (!roleId) throw new Error('Role id is required');
    return apiCall(`/roles/${roleId}/permissions`, { method: 'GET' });
  },

  // Update role permissions
  updatePermissions: async (roleId, permissions) => {
    if (!roleId) throw new Error('Role id is required');
    return apiCall(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  // Assign role to user (not implemented on backend)
  assignToUser: async () => {
    throw new Error('Assigning roles via this endpoint is not supported yet');
  },
};
