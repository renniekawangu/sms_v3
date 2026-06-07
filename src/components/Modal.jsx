import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Close modal on Escape key and manage focus
  useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    previousFocusRef.current = document.activeElement

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    // Prevent body scroll when modal is open
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-4 overflow-y-auto backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="form-shell w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto focus:outline-none border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_28px_70px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-text-dark sm:text-xl">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-xl p-2 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-blue"
            aria-label="Close modal"
          >
            <X size={20} className="sm:size-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
