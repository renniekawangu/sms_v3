import React from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
  isLoading = false
}) {
  if (!isOpen) return null

  const typeConfig = {
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    danger: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  }

  const config = typeConfig[type] || typeConfig.warning
  const Icon = config.icon

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-lg shadow-xl max-w-sm w-full border ${config.borderColor}`}>
          <div className={`${config.bgColor} p-4 flex items-start gap-3 rounded-t-lg`}>
            <Icon className={`${config.color} flex-shrink-0`} size={24} />
            <h2 className="text-lg font-semibold text-text-dark">{title}</h2>
          </div>

          <div className="p-6">
            <p className="text-text-muted mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-text-dark hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-colors ${
                  type === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : type === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-primary-blue hover:bg-primary-blue/90'
                }`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConfirmDialog
