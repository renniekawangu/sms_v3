/**
 * Debounce utility function
 * Delays function execution until specified time has passed without new calls
 */
export function debounce(func, wait = 500) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility function
 * Executes function at most once per specified interval
 */
export function throttle(func, limit = 500) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry utility for API calls
 * Retries a promise-based function with exponential backoff
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  backoffMultiplier = 2
) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
