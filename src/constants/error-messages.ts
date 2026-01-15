export const ERROR_MESSAGES: Record<number | string, string> = {
  '1000': 'Lỗi hệ thống không xác định',
  '1001': 'Khóa thông báo không hợp lệ',
  '1002': 'Lỗi máy chủ nội bộ',
  '1003': 'Dịch vụ tạm thời không khả dụng'
}

export const getErrorMessage = (
  code: number | string | undefined,
  defaultMessage: string = 'Lỗi không xác định'
): string => {
  if (code === undefined || code === null) return defaultMessage

  const errorCode = code.toString()
  return ERROR_MESSAGES[errorCode] ?? defaultMessage
}
