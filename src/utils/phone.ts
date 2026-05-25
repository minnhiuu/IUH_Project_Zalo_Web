export const PhoneUtil = {
  isValidVnPhone: (phone: string) => {
    if (!phone) return false
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    return /^(\+84|84|0)?([1-9]\d{8})$/.test(cleanPhone)
  },
  normalizeVnPhone: (phone: string) => {
    if (!phone) return null
    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const match = cleanPhone.match(/^(\+84|84|0)?([1-9]\d{8})$/)
    if (match) {
      return '0' + match[2]
    }
    return null
  }
}
