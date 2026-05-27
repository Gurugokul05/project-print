// API Service for Xerox Queue Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = {
  // Submit order to backend
  submitOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting order:', error)
      throw error
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`Payment error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  },

  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching order status:', error)
      throw error
    }
  },

  // Get current queue status
  getQueueStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/queue`)

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching queue status:', error)
      throw error
    }
  },

  // Upload files
  uploadFiles: async (files, orderId) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('orderId', orderId)

    try {
      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading files:', error)
      throw error
    }
  },
}

export default api
