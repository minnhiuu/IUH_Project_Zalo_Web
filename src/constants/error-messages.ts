export const ERROR_MESSAGES: Record<number | string, string> = {
  // System errors (9xxx)
  '9999': 'Lỗi hệ thống không xác định',

  // Authentication errors (1xxx)
  '1001': 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
  '1002': 'Bạn không có quyền thực hiện hành động này',
  '1003': 'Token không hợp lệ',
  '1004': 'Phiên làm việc đã hết hạn',
  '1005': 'Chữ ký Token không hợp lệ',
  '1006': 'Tên đăng nhập hoặc mật khẩu không khớp, vui lòng nhập lại',
  '1007': 'Thiết bị yêu cầu ID định danh',
  '1008': 'Thiết bị không khớp với phiên làm việc',
  '1009': 'Tài khoản đã được đăng nhập ở nơi khác',

  // User account errors (2xxx)
  '2001': 'Số điện thoại này đã được sử dụng',
  '2002': 'Email này đã được sử dụng',
  '2003': 'Không tìm thấy tài khoản',
  '2004': 'Người dùng không tồn tại',
  '2005': 'Mã OTP không chính xác hoặc đã hết hạn',
  '2006': 'Tên đăng nhập hoặc mật khẩu không khớp, vui lòng nhập lại',
  '2007': 'Tài khoản này được đăng nhập qua mạng xã hội',
  '2008': 'Thông tin định danh đã tồn tại',

  // Role and permission (21xx)
  '2101': 'Vai trò không tồn tại',
  '2102': 'Quyền hạn không tồn tại',
  '2103': 'Quyền hạn đang được sử dụng',

  // Validation (22xx)
  '2200': 'Dữ liệu không hợp lệ',
  '2201': 'Vui lòng nhập mã khuyến mãi',
  '2202': 'Trạng thái không hợp lệ',
  '2205': 'Thao tác không hợp lệ'
}

type ErrorData = Record<string, unknown>

const formatDynamicMessage = (code: string, data: ErrorData): string | null => {
  if (!code || !data) return null
  return null
}

export const getErrorMessage = (
  code: number | string | undefined,
  defaultMessage: string = 'Lỗi không xác định',
  data?: ErrorData
) => {
  if (code === undefined || code === null) return defaultMessage

  const errorCode = code.toString()

  if (data && Object.keys(data).length > 0) {
    const dynamicMessage = formatDynamicMessage(errorCode, data)
    if (dynamicMessage) return dynamicMessage
  }

  const translatedMessage = ERROR_MESSAGES[errorCode]
  return translatedMessage || defaultMessage
}
