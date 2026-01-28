import { storage } from '@/utils/local-storage'

export const getDeviceId = (): string => {
  const deviceId = storage.get<string>('device_id')
  if (deviceId) return deviceId

  const newId = crypto.randomUUID()
  storage.set('device_id', newId)
  return newId
}
