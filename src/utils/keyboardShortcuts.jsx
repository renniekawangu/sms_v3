/**
 * Keyboard Shortcuts Manager
 */
import { useEffect } from 'react'

const SHORTCUTS = {
  'Ctrl+K': 'search',
  'Ctrl+N': 'new',
  'Ctrl+E': 'export',
  'Ctrl+F': 'filter',
  'Escape': 'cancel',
  'Ctrl+S': 'save',
  'Ctrl+D': 'delete',
  'Enter': 'submit'
}

export const useKeyboardShortcuts = (callbacks = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        return
      }

      const key = [
        event.ctrlKey && 'Ctrl',
        event.shiftKey && 'Shift',
        event.altKey && 'Alt',
        event.key.length > 1 ? event.key : event.key.toUpperCase()
      ]
        .filter(Boolean)
        .join('+')

      const action = SHORTCUTS[key]
      if (action && callbacks[action]) {
        event.preventDefault()
        callbacks[action]()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callbacks])
}

export const KeyboardShortcutsHint = ({ shortcuts = [] }) => {
  if (shortcuts.length === 0) return null

  return (
    <div className="text-xs text-text-muted space-y-1 p-2 bg-gray-50 rounded border border-gray-200">
      <p className="font-semibold">Keyboard Shortcuts:</p>
      {shortcuts.map((shortcut, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="font-mono">{shortcut.keys}</span>
          <span>{shortcut.description}</span>
        </div>
      ))}
    </div>
  )
}

export default useKeyboardShortcuts
