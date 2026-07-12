export const normalizeChildCollection = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.children)) return payload.children
  if (Array.isArray(payload?.fees)) return payload.fees
  return []
}

export const matchesStudentReference = (record, studentId) => {
  if (!record || !studentId) return false

  const target = String(studentId).trim()
  if (!target) return false

  const candidates = [
    record.studentId,
    record.student_id,
    record.student?.id,
    record.student?._id,
    record.student?.studentId,
    record.student?.student_id,
    record.student?.uid,
    record.student?.userId,
    record.userId,
    record.uid,
  ]

  return candidates.some((candidate) => String(candidate || '').trim() === target)
}

export const filterRecordsByStudentReference = (records = [], studentId) => {
  return records.filter((record) => matchesStudentReference(record, studentId))
}

const gradeNumberMap = {
  'A+': 95,
  'A': 90,
  'B+': 85,
  'B': 80,
  'C+': 75,
  'C': 70,
  'D': 60,
  'F': 0,
}

export const getNumericPercentage = (record) => {
  if (!record || typeof record !== 'object') return null

  const percentageCandidates = [
    record.percentage,
    record.percent,
    record.overallPercentage,
    record.average,
    record.scorePercentage,
  ]

  for (const value of percentageCandidates) {
    if (value === undefined || value === null || value === '') continue
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric
  }

  const score = Number(record.score ?? record.marks ?? record.points)
  const maxMarks = Number(record.maxMarks ?? record.totalMarks ?? record.outOf ?? record.maximumMarks)
  if (Number.isFinite(score) && Number.isFinite(maxMarks) && maxMarks > 0) {
    return (score / maxMarks) * 100
  }

  const gradeValue = record.overallGrade || record.grade || record.finalGrade || record.endTermGrade || record.midTermGrade
  if (typeof gradeValue === 'string') {
    const normalized = gradeValue.trim().toUpperCase()
    if (gradeNumberMap[normalized]) return gradeNumberMap[normalized]
    if (/^A\+?$/.test(normalized)) return 95
    if (/^B\+?$/.test(normalized)) return 80
    if (/^C\+?$/.test(normalized)) return 70
    if (/^D$/.test(normalized)) return 60
    if (/^F$/.test(normalized)) return 0
  }

  return null
}

export const summarizeFees = (fees = [], payments = []) => {
  const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount || fee.totalAmount || fee.total || 0), 0)

  const totalPaid = fees.reduce((sum, fee) => {
    const feeId = fee._id || fee.id || fee.feeId || fee.fee_id
    const matchingPayments = payments.filter((payment) => {
      const paymentFeeId = payment.feeId || payment.fee_id || payment.fee?.id || payment.fee?._id
      return paymentFeeId && String(paymentFeeId) === String(feeId)
    })

    const derivedPaid = matchingPayments.reduce((paymentSum, payment) => paymentSum + Number(payment.amount || payment.total || 0), 0)
    const fallbackPaid = Number(fee.amountPaid || fee.paidAmount || fee.totalPaid || fee.amount_paid || 0)
    return sum + (derivedPaid > 0 ? derivedPaid : fallbackPaid)
  }, 0)

  return {
    totalFees,
    totalPaid,
    pendingFees: Math.max(totalFees - totalPaid, 0),
  }
}
