export function summarizeStudentAccount(fees = [], payments = []) {
  const normalizedFees = Array.isArray(fees) ? fees : []
  const normalizedPayments = Array.isArray(payments) ? payments : []

  const totalFees = normalizedFees.reduce((sum, fee) => sum + Number(fee?.amount || 0), 0)
  const totalPaid = normalizedPayments.reduce((sum, payment) => sum + Number(payment?.amount || payment?.paidAmount || payment?.amountPaid || 0), 0)
  const outstandingBalance = Math.max(0, totalFees - totalPaid)
  const paidPercentage = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0

  return {
    totalFees,
    totalPaid,
    outstandingBalance,
    paidPercentage,
    feeCount: normalizedFees.length,
    paymentCount: normalizedPayments.length,
  }
}

export default summarizeStudentAccount
