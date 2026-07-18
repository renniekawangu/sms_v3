export const ACCOUNT_REFRESH_EVENT = 'accounts:data:refresh'

export const notifyAccountDataRefresh = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ACCOUNT_REFRESH_EVENT))
}

export const subscribeToAccountRefresh = (callback) => {
  if (typeof window === 'undefined') return () => {}

  const handler = () => callback()
  window.addEventListener(ACCOUNT_REFRESH_EVENT, handler)

  return () => {
    window.removeEventListener(ACCOUNT_REFRESH_EVENT, handler)
  }
}
