import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, School, Calendar, DollarSign, Umbrella } from 'lucide-react'
import { settingsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import PageHeader from '../components/PageHeader'

function Settings() {
  const [activeTab, setActiveTab] = useState('school')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  // School Settings State
  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: '',
    schoolLogo: '',
    schoolDescription: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolAddress: '',
    currency: '',
    timezone: '',
    language: '',
    academicYearFormat: ''
  })

  // Academic Years State
  const [academicYears, setAcademicYears] = useState([])
  const [currentYear, setCurrentYear] = useState(null)

  // Fee Structures State
  const [feeStructures, setFeeStructures] = useState([])

  // Holidays State
  const [holidays, setHolidays] = useState([])

  // Form States for Creating New Items
  const [showNewAcademicYear, setShowNewAcademicYear] = useState(false)
  const [newAcademicYearForm, setNewAcademicYearForm] = useState({
    year: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    terms: []
  })
  const [newTerm, setNewTerm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  })

  // Term Management State
  const [expandedYearId, setExpandedYearId] = useState(null)
  const [editingTermId, setEditingTermId] = useState(null)
  const [editingTermData, setEditingTermData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  })
  const [showAddTermForm, setShowAddTermForm] = useState(null)

  // Academic Year Editing State
  const [editingYearId, setEditingYearId] = useState(null)
  const [editingYearData, setEditingYearData] = useState({
    year: '',
    startDate: '',
    endDate: ''
  })

  const [showNewFeeStructure, setShowNewFeeStructure] = useState(false)
  const [newFeeStructureForm, setNewFeeStructureForm] = useState({
    academicYear: '',
    classLevel: '',
    fees: []
  })

  const [showNewHoliday, setShowNewHoliday] = useState(false)
  const [newHolidayForm, setNewHolidayForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'school',
    description: ''
  })

  // Load data based on active tab
  useEffect(() => {
    loadTabData()
  }, [activeTab])

  const loadTabData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'school') {
        const data = await settingsApi.getSchoolSettings()
        setSchoolSettings({
          schoolName: data.schoolName || '',
          schoolLogo: data.schoolLogo || '',
          schoolDescription: data.schoolDescription || '',
          schoolPhone: data.schoolPhone || '',
          schoolEmail: data.schoolEmail || '',
          schoolAddress: data.schoolAddress || '',
          currency: data.currency || '',
          timezone: data.timezone || '',
          language: data.language || '',
          academicYearFormat: data.academicYearFormat || ''
        })
      } else if (activeTab === 'academic') {
        const data = await settingsApi.getAllAcademicYears()
        setAcademicYears(data.academicYears || [])
        setCurrentYear(data.currentYear)
      } else if (activeTab === 'fees') {
        const data = await settingsApi.getAllFeeStructures()
        setFeeStructures(data || [])
      } else if (activeTab === 'holidays') {
        const data = await settingsApi.getAllHolidays()
        setHolidays(data || [])
      }
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSchoolSettingsSubmit = async (e) => {
    e.preventDefault()
    try {
      await settingsApi.updateSchoolSettings(schoolSettings)
      showToast('School settings updated successfully', 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleCreateAcademicYear = async (yearData) => {
    try {
      await settingsApi.createAcademicYear(yearData)
      showToast('Academic year created successfully', 'success')
      setShowNewAcademicYear(false)
      setNewAcademicYearForm({ year: '', startDate: '', endDate: '', isCurrent: false, terms: [] })
      setNewTerm({ name: '', startDate: '', endDate: '' })
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleAddTerm = () => {
    if (!newTerm.name || !newTerm.startDate || !newTerm.endDate) {
      showToast('Please fill in all term fields', 'error')
      return
    }
    setNewAcademicYearForm({
      ...newAcademicYearForm,
      terms: [...newAcademicYearForm.terms, { ...newTerm, isActive: false }]
    })
    setNewTerm({ name: '', startDate: '', endDate: '' })
    showToast('Term added', 'success')
  }

  const handleRemoveTerm = (index) => {
    setNewAcademicYearForm({
      ...newAcademicYearForm,
      terms: newAcademicYearForm.terms.filter((_, i) => i !== index)
    })
  }

  const handleSubmitNewAcademicYear = (e) => {
    e.preventDefault()
    if (!newAcademicYearForm.year || !newAcademicYearForm.startDate || !newAcademicYearForm.endDate) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    if (newAcademicYearForm.terms.length === 0) {
      showToast('Please add at least one term', 'error')
      return
    }
    handleCreateAcademicYear(newAcademicYearForm)
  }

  const handleSetCurrentYear = async (yearId) => {
    try {
      await settingsApi.setCurrentAcademicYear(yearId)
      showToast('Current academic year updated', 'success')
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Term CRUD Operations
  const handleEditTerm = (yearId, termIndex, term) => {
    setEditingTermId(`${yearId}-${termIndex}`)
    setEditingTermData({
      name: term.name,
      startDate: term.startDate,
      endDate: term.endDate
    })
  }

  const handleSaveTermEdit = async (yearId, termIndex) => {
    if (!editingTermData.name || !editingTermData.startDate || !editingTermData.endDate) {
      showToast('Please fill in all term fields', 'error')
      return
    }

    try {
      const year = academicYears.find(y => y._id === yearId)
      if (!year) return

      const updatedTerms = [...year.terms]
      updatedTerms[termIndex] = editingTermData

      await settingsApi.updateAcademicYear(yearId, {
        terms: updatedTerms
      })

      showToast('Term updated successfully', 'success')
      setEditingTermId(null)
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleDeleteTerm = async (yearId, termIndex) => {
    if (!window.confirm('Delete this term?')) return

    try {
      const year = academicYears.find(y => y._id === yearId)
      if (!year) return

      const updatedTerms = year.terms.filter((_, i) => i !== termIndex)

      await settingsApi.updateAcademicYear(yearId, {
        terms: updatedTerms
      })

      showToast('Term deleted successfully', 'success')
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleAddTermToYear = async (yearId) => {
    const year = academicYears.find(y => y._id === yearId)
    if (!year) return

    if (!editingTermData.name || !editingTermData.startDate || !editingTermData.endDate) {
      showToast('Please fill in all term fields', 'error')
      return
    }

    try {
      const updatedTerms = [...(year.terms || []), editingTermData]

      await settingsApi.updateAcademicYear(yearId, {
        terms: updatedTerms
      })

      showToast('Term added successfully', 'success')
      setShowAddTermForm(null)
      setEditingTermData({ name: '', startDate: '', endDate: '' })
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Academic Year Edit/Delete Handlers
  const handleEditAcademicYear = (year) => {
    setEditingYearId(year._id)
    setEditingYearData({
      year: year.year,
      startDate: year.startDate,
      endDate: year.endDate
    })
  }

  const handleSaveAcademicYear = async () => {
    if (!editingYearData.year || !editingYearData.startDate || !editingYearData.endDate) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      await settingsApi.updateAcademicYear(editingYearId, {
        year: editingYearData.year,
        startDate: editingYearData.startDate,
        endDate: editingYearData.endDate
      })

      showToast('Academic year updated successfully', 'success')
      setEditingYearId(null)
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleDeleteAcademicYear = async (yearId) => {
    if (!window.confirm('Are you sure you want to delete this academic year? This will delete all associated terms.')) {
      return
    }

    try {
      await settingsApi.deleteAcademicYear(yearId)
      showToast('Academic year deleted successfully', 'success')
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleCreateFeeStructure = async (feeData) => {
    try {
      await settingsApi.createFeeStructure(feeData)
      showToast('Fee structure created successfully', 'success')
      setShowNewFeeStructure(false)
      setNewFeeStructureForm({ academicYear: '', classLevel: '', fees: [] })
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSubmitNewFeeStructure = (e) => {
    e.preventDefault()
    if (!newFeeStructureForm.academicYear || !newFeeStructureForm.classLevel) {
      showToast('Please fill in academic year and class level', 'error')
      return
    }
    handleCreateFeeStructure(newFeeStructureForm)
  }

  const handleCreateHoliday = async (holidayData) => {
    try {
      await settingsApi.createHoliday(holidayData)
      showToast('Holiday created successfully', 'success')
      setShowNewHoliday(false)
      setNewHolidayForm({ name: '', startDate: '', endDate: '', type: 'school', description: '' })
      loadTabData()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleSubmitNewHoliday = (e) => {
    e.preventDefault()
    if (!newHolidayForm.name || !newHolidayForm.startDate || !newHolidayForm.endDate) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    handleCreateHoliday(newHolidayForm)
  }

  const tabs = [
    { id: 'school', label: 'School Info', icon: School },
    { id: 'academic', label: 'Academic Years', icon: Calendar },
    { id: 'fees', label: 'Fee Structures', icon: DollarSign },
    { id: 'holidays', label: 'Holidays', icon: Umbrella }
  ]

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Configuration"
        title="School Settings"
        description="Manage core school identity, academic periods, fees, and holidays from one organized admin workspace."
        meta={
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active section</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 capitalize">{activeTab}</p>
          </div>
        }
      />

      {/* Tabs */}
      <div className="toolbar-card flex gap-1 sm:gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ui-tab whitespace-nowrap ${
                activeTab === tab.id
                  ? 'ui-tab-active'
                  : ''
              }`}
            >
              <Icon size={16} className="hidden sm:inline" />
              <span className="text-xs sm:text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="form-shell p-3 sm:p-4 lg:p-6">
        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading...</div>
        ) : (
          <>
            {/* School Settings Tab */}
            {activeTab === 'school' && (
              <form onSubmit={handleSchoolSettingsSubmit} className="space-y-5 max-w-4xl">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="font-display text-lg font-semibold text-slate-900">School identity and defaults</p>
                  <p className="mt-1 text-sm text-text-muted">Update the core settings that shape the rest of the system experience.</p>
                </div>

                <div className="form-grid-ui two-up">
                  <div className="ui-field md:col-span-2">
                    <label className="ui-label">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={schoolSettings.schoolName}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })}
                      className="ui-input"
                      required
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">School Logo URL</label>
                    <input
                      type="url"
                      value={schoolSettings.schoolLogo}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolLogo: e.target.value })}
                      placeholder="https://..."
                      className="ui-input"
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">Language</label>
                    <input
                      type="text"
                      value={schoolSettings.language}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, language: e.target.value })}
                      placeholder="en"
                      className="ui-input"
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">Currency Symbol</label>
                    <input
                      type="text"
                      value={schoolSettings.currency}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, currency: e.target.value })}
                      placeholder="K, $, €"
                      className="ui-input"
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">Timezone</label>
                    <input
                      type="text"
                      value={schoolSettings.timezone}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, timezone: e.target.value })}
                      placeholder="Africa/Lusaka"
                      className="ui-input"
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">Academic Year Format</label>
                    <input
                      type="text"
                      value={schoolSettings.academicYearFormat}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, academicYearFormat: e.target.value })}
                      placeholder="yyyy or yyyy-yyyy"
                      className="ui-input"
                    />
                  </div>

                  <div className="ui-field md:col-span-2">
                    <label className="ui-label">Description</label>
                    <textarea
                      value={schoolSettings.schoolDescription}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolDescription: e.target.value })}
                      className="ui-textarea"
                      rows="3"
                    />
                  </div>

                  <div className="ui-field md:col-span-2">
                    <label className="ui-label">Address</label>
                    <textarea
                      value={schoolSettings.schoolAddress}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolAddress: e.target.value })}
                      className="ui-textarea"
                      rows="3"
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">Phone</label>
                    <input
                      type="tel"
                      value={schoolSettings.schoolPhone}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolPhone: e.target.value })}
                      className="ui-input"
                    />
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">Email</label>
                    <input
                      type="email"
                      value={schoolSettings.schoolEmail}
                      onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolEmail: e.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-ui btn-primary"
                >
                  Save Settings
                </button>
              </form>
            )}

            {/* Academic Years Tab */}
            {activeTab === 'academic' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Academic Years</h3>
                  <button
                    onClick={() => setShowNewAcademicYear(!showNewAcademicYear)}
                    className="px-4 py-2 text-sm bg-primary-blue text-white rounded hover:bg-blue-600"
                  >
                    {showNewAcademicYear ? 'Cancel' : 'Add New Year'}
                  </button>
                </div>

                {showNewAcademicYear && (
                  <form onSubmit={handleSubmitNewAcademicYear} className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Academic Year *
                        </label>
                        <input
                          type="text"
                          value={newAcademicYearForm.year}
                          onChange={(e) => setNewAcademicYearForm({ ...newAcademicYearForm, year: e.target.value })}
                          placeholder="e.g., 2024 or 2024-2025"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={newAcademicYearForm.startDate}
                          onChange={(e) => setNewAcademicYearForm({ ...newAcademicYearForm, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={newAcademicYearForm.endDate}
                          onChange={(e) => setNewAcademicYearForm({ ...newAcademicYearForm, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isCurrent"
                          checked={newAcademicYearForm.isCurrent}
                          onChange={(e) => setNewAcademicYearForm({ ...newAcademicYearForm, isCurrent: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="isCurrent" className="ml-2 text-sm font-medium text-text-dark">
                          Set as Current Year
                        </label>
                      </div>
                    </div>

                    {/* Terms Section */}
                    <div className="mt-6 pt-6 border-t border-blue-300">
                      <h4 className="text-sm font-semibold text-text-dark mb-4">Add Terms</h4>
                      
                      <div className="bg-white p-3 rounded mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-text-dark mb-1">
                              Term Name (e.g., Term 1) *
                            </label>
                            <input
                              type="text"
                              value={newTerm.name}
                              onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })}
                              placeholder="Term 1"
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-dark mb-1">
                              Start Date *
                            </label>
                            <input
                              type="date"
                              value={newTerm.startDate}
                              onChange={(e) => setNewTerm({ ...newTerm, startDate: e.target.value })}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-dark mb-1">
                              End Date *
                            </label>
                            <input
                              type="date"
                              value={newTerm.endDate}
                              onChange={(e) => setNewTerm({ ...newTerm, endDate: e.target.value })}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTerm}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Add Term
                        </button>
                      </div>

                      {/* Terms List */}
                      {newAcademicYearForm.terms.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-text-dark">Added Terms ({newAcademicYearForm.terms.length}):</p>
                          {newAcademicYearForm.terms.map((term, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                              <div className="text-sm">
                                <span className="font-medium">{term.name}</span>
                                <p className="text-xs text-text-muted">
                                  {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTerm(index)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Academic Year
                    </button>
                  </form>
                )}

                <div className="space-y-4">
                  {academicYears.length === 0 ? (
                    <p className="text-text-muted">No academic years configured</p>
                  ) : (
                    academicYears.map((year) => (
                      <div key={year._id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {editingYearId === year._id ? (
                          /* Edit Mode */
                          <div className="p-4 bg-yellow-50 border-b border-yellow-300">
                            <h4 className="font-semibold text-sm mb-3">Edit Academic Year</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-text-dark mb-1">Academic Year *</label>
                                <input
                                  type="text"
                                  value={editingYearData.year}
                                  onChange={(e) => setEditingYearData({ ...editingYearData, year: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-text-dark mb-1">Start Date *</label>
                                <input
                                  type="date"
                                  value={editingYearData.startDate}
                                  onChange={(e) => setEditingYearData({ ...editingYearData, startDate: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-text-dark mb-1">End Date *</label>
                                <input
                                  type="date"
                                  value={editingYearData.endDate}
                                  onChange={(e) => setEditingYearData({ ...editingYearData, endDate: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveAcademicYear}
                                className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingYearId(null)}
                                className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedYearId(expandedYearId === year._id ? null : year._id)}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-lg">{year.year}</span>
                                {year.isCurrent && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-text-muted mt-1">
                                {year.startDate ? new Date(year.startDate).toLocaleDateString() : 'Start'} - {year.endDate ? new Date(year.endDate).toLocaleDateString() : 'End'}
                              </p>
                              <p className="text-xs text-text-muted mt-1">
                                {year.terms && year.terms.length > 0 ? `${year.terms.length} term(s)` : 'No terms'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {!year.isCurrent && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSetCurrentYear(year._id)
                                  }}
                                  className="px-3 py-2 text-sm bg-primary-blue text-white rounded hover:bg-blue-600"
                                >
                                  Set as Current
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditAcademicYear(year)
                                }}
                                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteAcademicYear(year._id)
                                }}
                                className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Delete
                              </button>
                              <button className="px-2 py-2 text-gray-600">
                                {expandedYearId === year._id ? '▲' : '▼'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Expanded Terms Section */}
                        {expandedYearId === year._id && (
                          <div className="p-4 border-t border-gray-200">
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-3">Terms Management</h4>

                              {/* Terms List */}
                              {year.terms && year.terms.length > 0 && (
                                <div className="mb-4 space-y-2">
                                  {year.terms.map((term, termIndex) => (
                                    <div key={termIndex} className="p-3 bg-gray-50 rounded border border-gray-200">
                                      {editingTermId === `${year._id}-${termIndex}` ? (
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-3 gap-2">
                                            <input
                                              type="text"
                                              value={editingTermData.name}
                                              onChange={(e) => setEditingTermData({ ...editingTermData, name: e.target.value })}
                                              placeholder="Term name"
                                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                            <input
                                              type="date"
                                              value={editingTermData.startDate}
                                              onChange={(e) => setEditingTermData({ ...editingTermData, startDate: e.target.value })}
                                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                            <input
                                              type="date"
                                              value={editingTermData.endDate}
                                              onChange={(e) => setEditingTermData({ ...editingTermData, endDate: e.target.value })}
                                              className="px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleSaveTermEdit(year._id, termIndex)}
                                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => setEditingTermId(null)}
                                              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-start">
                                          <div className="text-sm">
                                            <p className="font-medium">{term.name}</p>
                                            <p className="text-xs text-text-muted">
                                              {term.startDate ? new Date(term.startDate).toLocaleDateString() : ''} - {term.endDate ? new Date(term.endDate).toLocaleDateString() : ''}
                                            </p>
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => handleEditTerm(year._id, termIndex, term)}
                                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTerm(year._id, termIndex)}
                                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Term Form */}
                              {showAddTermForm === year._id ? (
                                <div className="p-3 bg-blue-50 rounded border border-blue-300">
                                  <div className="grid grid-cols-3 gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={editingTermData.name}
                                      onChange={(e) => setEditingTermData({ ...editingTermData, name: e.target.value })}
                                      placeholder="Term name"
                                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                                    />
                                    <input
                                      type="date"
                                      value={editingTermData.startDate}
                                      onChange={(e) => setEditingTermData({ ...editingTermData, startDate: e.target.value })}
                                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                                    />
                                    <input
                                      type="date"
                                      value={editingTermData.endDate}
                                      onChange={(e) => setEditingTermData({ ...editingTermData, endDate: e.target.value })}
                                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAddTermToYear(year._id)}
                                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                      Add Term
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddTermForm(null)
                                        setEditingTermData({ name: '', startDate: '', endDate: '' })
                                      }}
                                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowAddTermForm(year._id)
                                    setEditingTermData({ name: '', startDate: '', endDate: '' })
                                  }}
                                  className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  + Add Term
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Fee Structures Tab */}
            {activeTab === 'fees' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Fee Structures</h3>
                  <button
                    onClick={() => setShowNewFeeStructure(!showNewFeeStructure)}
                    className="px-4 py-2 text-sm bg-primary-blue text-white rounded hover:bg-blue-600"
                  >
                    {showNewFeeStructure ? 'Cancel' : 'Add New Structure'}
                  </button>
                </div>

                {showNewFeeStructure && (
                  <form onSubmit={handleSubmitNewFeeStructure} className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Academic Year *
                        </label>
                        <select
                          value={newFeeStructureForm.academicYear}
                          onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, academicYear: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        >
                          <option value="">Select Academic Year</option>
                          {academicYears.map((year) => (
                            <option key={year._id} value={year.year}>{year.year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Class Level *
                        </label>
                        <input
                          type="text"
                          value={newFeeStructureForm.classLevel}
                          onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, classLevel: e.target.value })}
                          placeholder="e.g., Grade 1, Form 1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Fee Structure
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {feeStructures.length === 0 ? (
                    <p className="text-text-muted">No fee structures configured</p>
                  ) : (
                    feeStructures.map((fee) => (
                      <div
                        key={fee._id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{fee.classLevel}</span>
                            <p className="text-sm text-text-muted">Academic Year: {fee.academicYear}</p>
                          </div>
                          <span className="text-sm text-text-muted">Payment terms: {fee.paymentTerms?.acceptsPartialPayment ? 'Partial allowed' : 'Full'}</span>
                        </div>

                        {fee.fees && fee.fees.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {fee.fees.map((item) => (
                              <div key={item._id || item.name} className="flex justify-between text-sm border border-gray-100 rounded px-3 py-2">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  {item.description && (
                                    <p className="text-text-muted">{item.description}</p>
                                  )}
                                  {item.dueDate && (
                                    <p className="text-xs text-text-muted">Due: {item.dueDate}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-primary-blue">{item.amount}</p>
                                  {item.optional && (
                                    <p className="text-xs text-text-muted">Optional</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-muted mt-2">No fees defined</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Holidays Tab */}
            {activeTab === 'holidays' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">School Holidays</h3>
                  <button
                    onClick={() => setShowNewHoliday(!showNewHoliday)}
                    className="px-4 py-2 text-sm bg-primary-blue text-white rounded hover:bg-blue-600"
                  >
                    {showNewHoliday ? 'Cancel' : 'Add Holiday'}
                  </button>
                </div>

                {showNewHoliday && (
                  <form onSubmit={handleSubmitNewHoliday} className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Holiday Name *
                        </label>
                        <input
                          type="text"
                          value={newHolidayForm.name}
                          onChange={(e) => setNewHolidayForm({ ...newHolidayForm, name: e.target.value })}
                          placeholder="e.g., Christmas Break"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={newHolidayForm.startDate}
                          onChange={(e) => setNewHolidayForm({ ...newHolidayForm, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={newHolidayForm.endDate}
                          onChange={(e) => setNewHolidayForm({ ...newHolidayForm, endDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Holiday Type
                        </label>
                        <select
                          value={newHolidayForm.type}
                          onChange={(e) => setNewHolidayForm({ ...newHolidayForm, type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        >
                          <option value="school">School Holiday</option>
                          <option value="public">Public Holiday</option>
                          <option value="exam">Exam Break</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Description
                        </label>
                        <textarea
                          value={newHolidayForm.description}
                          onChange={(e) => setNewHolidayForm({ ...newHolidayForm, description: e.target.value })}
                          placeholder="Optional description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          rows="2"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Holiday
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {holidays.length === 0 ? (
                    <p className="text-text-muted">No holidays configured</p>
                  ) : (
                    holidays.map((holiday) => (
                      <div
                        key={holiday._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{holiday.name}</span>
                          <p className="text-sm text-text-muted">
                            {holiday.startDate ? new Date(holiday.startDate).toLocaleDateString() : ''}
                            {holiday.endDate ? ` - ${new Date(holiday.endDate).toLocaleDateString()}` : ''}
                          </p>
                          {holiday.type && (
                            <p className="text-xs text-text-muted">Type: {holiday.type}</p>
                          )}
                          {holiday.affectsAttendance !== undefined && (
                            <p className="text-xs text-text-muted">Affects attendance: {holiday.affectsAttendance ? 'Yes' : 'No'}</p>
                          )}
                          {holiday.description && (
                            <p className="text-xs text-text-muted">{holiday.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Settings
