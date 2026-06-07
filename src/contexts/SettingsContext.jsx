import { createContext, useContext, useState, useEffect } from 'react'
import { settingsApi } from '../services/api'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: 'Capri School',
    schoolLogo: '',
    schoolDescription: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolAddress: '',
    currency: 'K',
    timezone: 'Africa/Lusaka',
    language: 'en',
    academicYearFormat: 'yyyy'
  })

  const [academicYears, setAcademicYears] = useState([])
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Load school settings
      const settingsData = await settingsApi.getSchoolSettings()
      setSchoolSettings({
        schoolName: settingsData.schoolName || 'Capri School',
        schoolLogo: settingsData.schoolLogo || '',
        schoolDescription: settingsData.schoolDescription || '',
        schoolPhone: settingsData.schoolPhone || '',
        schoolEmail: settingsData.schoolEmail || '',
        schoolAddress: settingsData.schoolAddress || '',
        currency: settingsData.currency || 'K',
        timezone: settingsData.timezone || 'Africa/Lusaka',
        language: settingsData.language || 'en',
        academicYearFormat: settingsData.academicYearFormat || 'yyyy'
      })

      // Load academic years
      const yearsData = await settingsApi.getAllAcademicYears()
      setAcademicYears(yearsData.academicYears || [])
      setCurrentAcademicYear(yearsData.currentYear)
    } catch (error) {
      console.error('Error loading settings:', error)
      // Use defaults if fetch fails
    } finally {
      setLoading(false)
    }
  }

  // Refresh settings (useful after changes)
  const refreshSettings = async () => {
    await loadSettings()
  }

  const value = {
    schoolSettings,
    academicYears,
    currentAcademicYear,
    loading,
    refreshSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
