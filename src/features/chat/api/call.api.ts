import http from '@/lib/axios-client'
import type { ApiResponse } from '@/shared/api'

export interface CallRequest {
  receiverId: string
  callKind?: string
}

export interface CallResponse {
  sessionId: string
  roomId: string
  rtcToken: string
  appId: number
  callerId: string
  callerName: string
  callerAvatar: string
  receiverId: string
  receiverName: string
  receiverAvatar: string
}

export const initiateCallApi = async (request: CallRequest): Promise<CallResponse> => {
  const response = await http.post<ApiResponse<CallResponse>>('/messages/calls/initiate', request)
  return response.data.data
}

export const acceptCallApi = async (sessionId: string): Promise<CallResponse> => {
  const response = await http.post<ApiResponse<CallResponse>>(`/messages/calls/${sessionId}/accept`)
  return response.data.data
}

export const rejectCallApi = async (sessionId: string): Promise<void> => {
  await http.post(`/messages/calls/${sessionId}/reject`)
}

export const endCallApi = async (sessionId: string): Promise<void> => {
  await http.post(`/messages/calls/${sessionId}/end`)
}

export const cancelCallApi = async (sessionId: string): Promise<void> => {
  await http.post(`/messages/calls/${sessionId}/cancel`)
}

export const getCallTokenApi = async (sessionId: string): Promise<CallResponse> => {
  const response = await http.get<ApiResponse<CallResponse>>(`/messages/calls/${sessionId}/token`)
  return response.data.data
}
