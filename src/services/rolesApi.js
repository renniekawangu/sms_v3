import { apiCall } from './api'

// Role Management API Service

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
