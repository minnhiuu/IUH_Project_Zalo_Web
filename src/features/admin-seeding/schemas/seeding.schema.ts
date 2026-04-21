export type SeedResponsePayload = Record<string, unknown>

export type SeedEndpointInfo = {
  key: 'auth-accounts' | 'social-seed-all' | 'user-seed-interests'
  service: string
  method: 'POST' | 'PUT'
  gatewayPath: string
  servicePath: string
  authorization: string
  webAccessible: boolean
  notes: string
}

export type SeedExecution = {
  endpointKey: SeedEndpointInfo['key']
  endpointPath: string
  executedAt: string
  success: boolean
  message: string
  payload?: SeedResponsePayload
}
