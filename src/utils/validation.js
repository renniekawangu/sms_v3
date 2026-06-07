/**
 * Form Validation Utilities
 */

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePhone = (phone) => {
  const regex = /^[0-9\s\-\+\(\)]+$/
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.length <= 100
}

export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined
}

export const validateMinLength = (value, min) => {
  return value && value.length >= min
}

export const validateMaxLength = (value, max) => {
  return value && value.length <= max
}

export const validateNumber = (value) => {
  return !isNaN(value) && isFinite(value)
}

export const validateDate = (date) => {
  return date && !isNaN(new Date(date).getTime())
}

export const validateAmount = (amount) => {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0
}

export const validateFormData = (formData, schema) => {
  const errors = {}

  Object.entries(schema).forEach(([field, rules]) => {
    const value = formData[field]

    rules.forEach(rule => {
      if (rule.type === 'required' && !validateRequired(value)) {
        errors[field] = rule.message || `${field} is required`
      }
      if (rule.type === 'email' && value && !validateEmail(value)) {
        errors[field] = rule.message || 'Invalid email format'
      }
      if (rule.type === 'phone' && value && !validatePhone(value)) {
        errors[field] = rule.message || 'Invalid phone format'
      }
      if (rule.type === 'minLength' && value && !validateMinLength(value, rule.value)) {
        errors[field] = rule.message || `Minimum length is ${rule.value}`
      }
      if (rule.type === 'maxLength' && value && !validateMaxLength(value, rule.value)) {
        errors[field] = rule.message || `Maximum length is ${rule.value}`
      }
      if (rule.type === 'number' && value && !validateNumber(value)) {
        errors[field] = rule.message || 'Must be a number'
      }
      if (rule.type === 'custom' && !rule.validator(value)) {
        errors[field] = rule.message || 'Invalid value'
      }
    })
  })

  return errors
}

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0
}

export const clearFieldError = (errors, field) => {
  const newErrors = { ...errors }
  delete newErrors[field]
  return newErrors
}
