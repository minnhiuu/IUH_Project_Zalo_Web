export type ApiResponse<T = unknown> = {
  code: number
  message: string
  data: T
  errors?: Record<string, string>
}

export type PageResponse<T = unknown> = {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}
