export type ApiResponse<T = unknown> = {
  status: number
  message: string
  data: T
}

export type PageResponse<T = unknown> = {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}
