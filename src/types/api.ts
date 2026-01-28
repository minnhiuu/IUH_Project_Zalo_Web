export type ApiResponse<T = unknown> = {
  status: number
  message: string
  data: T
}

export type PageResponse<T = unknown> = {
  content: T[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}
