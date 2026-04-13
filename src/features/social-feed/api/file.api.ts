import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

interface FileUploadResponse {
  fileName: string
  key: string
}

export const fileApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return http.post<ApiResponse<FileUploadResponse>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
