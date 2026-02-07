import { storage, STORAGE_KEYS } from '@/utils/local-storage'

export const getDeviceId = (): string => {
  const deviceId = storage.get<string>(STORAGE_KEYS.DEVICE_ID)
  if (deviceId) return deviceId

  const newId = crypto.randomUUID()
  storage.set(STORAGE_KEYS.DEVICE_ID, newId)
  return newId
}
