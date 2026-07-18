import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ArrowUpRight, CreditCard, DollarSign } from 'lucide-react'
import { studentApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { formatCurrency, useCurrency } from '../hooks/useCurrency'
import PageHeader from '../components/PageHeader'
import { summarizeStudentAccount } from '../utils/studentAccount'

function StudentAccount() {
  const [fees, setFees] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { error: showError } = useToast()
  const currency = useCurrency()

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setLoading(true)
        setError(null)

        const [feesData, paymentsData] = await Promise.all([
          studentApi.getMyFees(),
          studentApi.getMyPayments(),
        ])

        setFees(Array.isArray(feesData) ? feesData : (feesData?.fees || feesData?.data || []))
        setPayments(Array.isArray(paymentsData) ? paymentsData : (paymentsData?.payments || paymentsData?.data || []))
      } catch (err) {
        const message = err.message || 'Failed to load your account information'
        setError(message)
        showError(message)
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [showError])

  const summary = useMemo(() => summarizeStudentAccount(fees, payments), [fees, payments])

  const formatDate = (value) => {
    if (!value) return '—'
    if (value.toDate) return value.toDate().toLocaleDateString()
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="My Account"
        description="Track your fees, payments, and remaining balance."
      />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-600">Loading your account...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5" />
            <div>
              <p className="font-medium">We could not load your account right now.</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total Fees</p>
                <DollarSign size={18} className="text-cyan-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(summary.totalFees, currency)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Paid So Far</p>
                <ArrowUpRight size={18} className="text-emerald-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-emerald-600">{formatCurrency(summary.totalPaid, currency)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Outstanding Balance</p>
                <CreditCard size={18} className="text-amber-600" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-amber-600">{formatCurrency(summary.outstandingBalance, currency)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Payment Progress</p>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{summary.paidPercentage}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${Math.min(100, summary.paidPercentage)}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">{summary.paymentCount} payment record{summary.paymentCount === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Fee Records</h2>
                <span className="text-sm text-slate-500">{fees.length} item{fees.length === 1 ? '' : 's'}</span>
              </div>

              {fees.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No fee records available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Description</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Paid</th>
                        <th className="px-3 py-2 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => {
                        const amount = Number(fee.amount || 0)
                        const paid = Number(fee.amountPaid || fee.paidAmount || 0)
                        const balance = Math.max(0, amount - paid)

                        return (
                          <tr key={fee._id || fee.id || fee.fee_id} className="border-t border-slate-100">
                            <td className="px-3 py-3 text-slate-700">{fee.description || fee.title || 'Fee record'}</td>
                            <td className="px-3 py-3">{formatCurrency(amount, currency)}</td>
                            <td className="px-3 py-3">{formatCurrency(paid, currency)}</td>
                            <td className="px-3 py-3">{formatCurrency(balance, currency)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
                <span className="text-sm text-slate-500">{payments.length} record{payments.length === 1 ? '' : 's'}</span>
              </div>

              {payments.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No payments have been recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id || payment.id || payment.payment_id} className="border-t border-slate-100">
                          <td className="px-3 py-3 text-slate-700">{formatDate(payment.date || payment.createdAt || payment.updatedAt)}</td>
                          <td className="px-3 py-3">{formatCurrency(Number(payment.amount || payment.paidAmount || payment.amountPaid || 0), currency)}</td>
                          <td className="px-3 py-3">{payment.method || payment.paymentMethod || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default StudentAccount
