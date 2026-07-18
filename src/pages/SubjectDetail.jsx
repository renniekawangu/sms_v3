import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Link as LinkIcon, Plus, Trash2, AlertCircle } from 'lucide-react'
import { subjectsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ROLES, normalizeRole } from '../config/rbac'

function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const normalizedRole = normalizeRole(user?.role)
  const canEditMaterials = [ROLES.ADMIN, ROLES.TEACHER, ROLES.HEAD_TEACHER].includes(normalizedRole)

  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [materialForm, setMaterialForm] = useState({ title: '', url: '', description: '' })

  const loadSubject = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await subjectsApi.get(id)
      const studyMaterials = Array.isArray(data.studyMaterials) ? data.studyMaterials : []
      setSubject({
        ...data,
        studyMaterials: studyMaterials.map((material, index) => ({
          id: material.id || material._id || material.materialId || `${Date.now()}-${index}`,
          title: material.title || material.name || 'Untitled material',
          description: material.description || '',
          url: material.url || '',
        })),
      })
    } catch (err) {
      setError(err.message || 'Failed to load subject')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubject()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setMaterialForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!materialForm.title.trim()) {
      setError('Title is required for study material')
      return
    }

    if (!subject) return

    setSaving(true)
    setError(null)

    const newMaterial = {
      id: `mat-${Date.now()}`,
      title: materialForm.title.trim(),
      url: materialForm.url.trim(),
      description: materialForm.description.trim(),
    }

    const updatedMaterials = [...(subject.studyMaterials || []), newMaterial]
    try {
      await subjectsApi.update(subject._id || subject.subject_id || id, {
        studyMaterials: updatedMaterials,
      })
      setSubject((prev) => prev && ({ ...prev, studyMaterials: updatedMaterials }))
      setMaterialForm({ title: '', url: '', description: '' })
      setError(null)
      success('Study material added successfully')
    } catch (err) {
      const message = err.message || 'Failed to add study material'
      setError(message)
      showError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (!subject) return
    if (!window.confirm('Delete this study material?')) return

    setSaving(true)
    setError(null)

    const updatedMaterials = subject.studyMaterials.filter((item) => item.id !== materialId)

    try {
      await subjectsApi.update(subject._id || subject.subject_id || id, {
        studyMaterials: updatedMaterials,
      })
      setSubject((prev) => prev && ({ ...prev, studyMaterials: updatedMaterials }))
      success('Study material removed successfully')
    } catch (err) {
      const message = err.message || 'Failed to delete study material'
      setError(message)
      showError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading subject details...</p>
        </div>
      </div>
    )
  }

  if (error && !subject) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-semibold mb-2">Unable to load subject</p>
          <p className="text-text-muted mb-6">{error}</p>
          <button
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    )
  }

  const materialCount = subject?.studyMaterials?.length || 0

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/subjects" className="inline-flex items-center gap-2 text-sm text-primary-blue hover:text-primary-blue/90 mb-3">
            <ArrowLeft size={16} /> Back to Subjects
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-dark">{subject.name}</h1>
          <p className="text-sm text-text-muted mt-1">Subject details and study materials</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-text-dark">
          <p className="font-medium">Grade {subject.grade || 'N/A'}</p>
          <p className="text-text-muted">Code: {subject.code || 'N/A'}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-primary-blue" />
              <h2 className="text-lg font-semibold text-text-dark">About this subject</h2>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {subject.description || 'No description provided for this subject yet.'}
            </p>
          </div>

          <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-dark">Study Materials</h2>
                <p className="text-xs text-text-muted mt-1">{materialCount} material{materialCount === 1 ? '' : 's'} available</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-blue/10 px-3 py-1 text-xs font-medium text-primary-blue">
                <LinkIcon size={14} /> Resources
              </div>
            </div>

            {subject.studyMaterials && subject.studyMaterials.length > 0 ? (
              <div className="space-y-3">
                {subject.studyMaterials.map((material) => (
                  <div key={material.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-text-dark text-sm sm:text-base truncate">{material.title}</h3>
                        <p className="text-xs text-text-muted mt-1 line-clamp-3">{material.description || 'No description provided.'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {material.url ? (
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-primary-blue px-3 py-2 text-xs font-medium text-primary-blue hover:bg-primary-blue/10 transition-colors"
                          >
                            Open Link
                          </a>
                        ) : null}
                        {canEditMaterials ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-text-muted">
                No study materials have been added yet.
              </div>
            )}
          </div>
        </div>

        {canEditMaterials ? (
          <div className="space-y-4">
            <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={20} className="text-primary-blue" />
                <h2 className="text-lg font-semibold text-text-dark">Add Study Material</h2>
              </div>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <label htmlFor="title" className="text-sm font-medium text-text-dark block mb-2">
                    Material Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={materialForm.title}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    placeholder="Enter a title for this material"
                  />
                </div>

                <div>
                  <label htmlFor="url" className="text-sm font-medium text-text-dark block mb-2">
                    Resource Link
                  </label>
                  <input
                    id="url"
                    name="url"
                    type="url"
                    value={materialForm.url}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-medium text-text-dark block mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={materialForm.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    placeholder="Add a short description of the material"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-primary-blue/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Material'}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SubjectDetail
