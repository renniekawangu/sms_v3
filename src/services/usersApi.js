import { apiCall } from './api'

/**
 * Users API Service
 * Handles all user management operations (admin-only)
 */

export const usersApi = {
  /**
   * Get all users
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers() {
    return apiCall('/users')
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUserById(userId) {
    return apiCall(`/users/${userId}`)
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password (will be hashed)
   * @param {string} userData.role - User's role (admin, teacher, student, etc.)
   * @param {string} [userData.phone] - User's phone number
   * @param {string} [userData.date_of_join] - User's join date (ISO format)
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  },

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteUser(userId) {
    return apiCall(`/users/${userId}`, {
      method: 'DELETE'
    })
  }
}

export default usersApi
