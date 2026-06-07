const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/messages` : '/api/messages'

// Helper function to get auth token
function getAuthToken() {
  // First try to get from user object
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      if (user.token) {
        console.log('[AUTH] Found token in user object')
        return user.token
      }
    } catch (e) {
      console.error('[AUTH] Error parsing user:', e)
    }
  }
  
  // Fallback to direct authToken if it exists
  const token = localStorage.getItem('authToken')
  if (token) {
    console.log('[AUTH] Found token in localStorage')
  }
  return token
}

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
    console.log('[API] Sending with Bearer token')
  } else {
    console.warn('[API] No token found! This request will likely fail with 401')
  }

  const url = `${API_URL}${endpoint}`
  console.log('[API] Request:', { url, method: options.method || 'GET', headers: { ...headers, Authorization: headers.Authorization ? '***' : 'none' } })

  const response = await fetch(url, {
    ...options,
    headers
  })

  console.log('[API] Response status:', response.status)

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        const errorText = await response.text()
        if (errorText) {
          try {
            const parsed = JSON.parse(errorText)
            errorMessage = parsed.message || parsed.error || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
        }
      }
    } catch (parseError) {
      console.error('[API] Error parsing error response:', parseError)
    }
    console.error('[API] Error response:', errorMessage)
    throw new Error(errorMessage)
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text()
    return text ? JSON.parse(text) : {}
  }
  
  return {}
}

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
