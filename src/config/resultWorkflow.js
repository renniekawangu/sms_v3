export const RESULT_STATUSES = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
})

export const RESULT_STATUS_ORDER = Object.freeze([
  RESULT_STATUSES.DRAFT,
  RESULT_STATUSES.SUBMITTED,
  RESULT_STATUSES.APPROVED,
  RESULT_STATUSES.PUBLISHED,
  RESULT_STATUSES.REJECTED,
])

export const RESULT_STATUS_META = Object.freeze({
  [RESULT_STATUSES.DRAFT]: {
    label: 'Draft',
    filterLabel: 'Draft',
    badgeClass: 'bg-gray-100 text-gray-700',
    approvalBadgeClass: 'bg-gray-100 text-gray-700',
  },
  [RESULT_STATUSES.SUBMITTED]: {
    label: 'Pending Approval',
    filterLabel: 'Pending Approval',
    badgeClass: 'bg-cyan-100 text-cyan-700',
    approvalBadgeClass: 'bg-blue-100 text-blue-700',
  },
  [RESULT_STATUSES.APPROVED]: {
    label: 'Approved',
    filterLabel: 'Approved (Not Published)',
    badgeClass: 'bg-green-100 text-green-700',
    approvalBadgeClass: 'bg-yellow-100 text-yellow-700',
  },
  [RESULT_STATUSES.PUBLISHED]: {
    label: 'Published',
    filterLabel: 'Published',
    badgeClass: 'bg-purple-100 text-purple-700',
    approvalBadgeClass: 'bg-green-100 text-green-700',
  },
  [RESULT_STATUSES.REJECTED]: {
    label: 'Rejected',
    filterLabel: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700',
    approvalBadgeClass: 'bg-red-100 text-red-700',
  },
})

export const RESULT_STATUS_FILTER_OPTIONS = Object.freeze([
  { value: '', label: 'All Statuses' },
  { value: RESULT_STATUSES.DRAFT, label: RESULT_STATUS_META[RESULT_STATUSES.DRAFT].filterLabel },
  { value: RESULT_STATUSES.SUBMITTED, label: RESULT_STATUS_META[RESULT_STATUSES.SUBMITTED].filterLabel },
  { value: RESULT_STATUSES.APPROVED, label: RESULT_STATUS_META[RESULT_STATUSES.APPROVED].filterLabel },
  { value: RESULT_STATUSES.PUBLISHED, label: RESULT_STATUS_META[RESULT_STATUSES.PUBLISHED].filterLabel },
  { value: RESULT_STATUSES.REJECTED, label: RESULT_STATUS_META[RESULT_STATUSES.REJECTED].filterLabel },
])

export const RESULT_WORKFLOW_TRANSITIONS = Object.freeze({
  [RESULT_STATUSES.DRAFT]: {
    action: 'submit',
    nextStatus: RESULT_STATUSES.SUBMITTED,
    actionLabel: 'submitted',
  },
  [RESULT_STATUSES.SUBMITTED]: {
    action: 'approve',
    nextStatus: RESULT_STATUSES.APPROVED,
    actionLabel: 'approved',
  },
  [RESULT_STATUSES.APPROVED]: {
    action: 'publish',
    nextStatus: RESULT_STATUSES.PUBLISHED,
    actionLabel: 'published',
  },
})

export const normalizeResultStatus = (status) => {
  const value = typeof status === 'string' ? status.trim().toLowerCase() : ''
  const legacyStatusMap = {
    submit: RESULT_STATUSES.SUBMITTED,
    approve: RESULT_STATUSES.APPROVED,
    publish: RESULT_STATUSES.PUBLISHED,
    pending: RESULT_STATUSES.SUBMITTED,
  }

  const normalizedValue = legacyStatusMap[value] || value
  return Object.prototype.hasOwnProperty.call(RESULT_STATUS_META, normalizedValue) ? normalizedValue : RESULT_STATUSES.DRAFT
}

export const getResultStatusMeta = (status) => {
  return RESULT_STATUS_META[normalizeResultStatus(status)] || RESULT_STATUS_META[RESULT_STATUSES.DRAFT]
}

export const getResultTransition = (currentStatus) => {
  return RESULT_WORKFLOW_TRANSITIONS[normalizeResultStatus(currentStatus)] || null
}
