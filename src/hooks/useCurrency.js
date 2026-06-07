import { useState, useEffect } from 'react'
import { settingsApi } from '../services/api'

/**
 * Custom hook to get currency symbol from school settings
 * Returns the currency symbol (default: 'K' for Kwacha)
 */
export function useCurrency() {
  const [currency, setCurrency] = useState('K')

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const settings = await settingsApi.getSchoolSettings()
        if (settings.currency) {
          setCurrency(settings.currency)
        }
      } catch (error) {
        console.warn('Failed to load currency from settings, using default:', error)
        // Keep default 'K'
      }
    }

    fetchCurrency()
  }, [])

  return currency
}

/**
 * Format currency with the school's currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'K') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—'
  }
  return `${currency}${Number(amount).toLocaleString()}`
}
