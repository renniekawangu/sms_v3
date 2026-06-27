import { apiCall } from './api'

const apiRequest = (endpoint, options = {}) => apiCall(`/messages${endpoint}`, options)

export const messagesApi = {
  // Get inbox (received messages)
  getInbox: async () => {
    return apiRequest('/inbox')
  },

  // Get sent messages
  getSent: async () => {
    return apiRequest('/sent')
  },

  // Get conversation with a specific user
  getConversation: async (userId) => {
    return apiRequest(`/conversation/${userId}`)
  },

  // Send a message
  sendMessage: async (data) => {
    return apiRequest('/send', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    return apiRequest(`/${messageId}/read`, {
      method: 'PATCH'
    })
  },

  // Get unread message count
  getUnreadCount: async () => {
    return apiRequest('/unread/count')
  },

  // Get list of contacts
  getContacts: async () => {
    return apiRequest('/contacts/list')
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    return apiRequest(`/${messageId}`, {
      method: 'DELETE'
    })
  },

  // Search messages
  searchMessages: async (query) => {
    return apiRequest(`/search/${query}`)
  }
}
