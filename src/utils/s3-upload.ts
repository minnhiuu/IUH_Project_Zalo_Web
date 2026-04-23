import { showErrorToast } from './toast'

export interface S3UploadItem {
  url: string
  file: File | Blob
  contentType: string
  onProgress?: (percent: number) => void
}

/**
 * Uploads a file directly to S3 using a presigned URL.
 * Uses XMLHttpRequest to provide upload progress tracking.
 */
export const uploadToS3 = (item: S3UploadItem): Promise<void> => {
  const { url, file, contentType, onProgress } = item

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(percentComplete)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve()
      } else {
        const errorMsg = `S3 Upload failed with status: ${xhr.status}`
        showErrorToast(errorMsg)
        reject(new Error(errorMsg))
      }
    }

    xhr.onerror = () => {
      const errorMsg = 'S3 Upload network error'
      showErrorToast(errorMsg)
      reject(new Error(errorMsg))
    }
    xhr.send(file)
  })
}

/**
 * Uploads multiple files to S3 in parallel.
 * Calculates total progress based on individual file sizes.
 */
export const uploadBatchToS3 = async (
  items: S3UploadItem[],
  onTotalProgress?: (percent: number) => void
): Promise<void> => {
  if (items.length === 0) return

  const totalSize = items.reduce((acc, item) => acc + item.file.size, 0)
  const loadedMap = new Map<number, number>()

  const uploadPromises = items.map((item, index) => {
    const internalOnProgress = (percent: number) => {
      // Call item's own progress if it exists
      if (item.onProgress) {
        item.onProgress(percent)
      }

      // Calculate total progress
      const loadedForThisFile = (percent / 100) * item.file.size
      loadedMap.set(index, loadedForThisFile)

      if (onTotalProgress) {
        const totalLoaded = Array.from(loadedMap.values()).reduce((a, b) => a + b, 0)
        const overallPercent = Math.min(Math.round((totalLoaded / totalSize) * 100), 100)
        onTotalProgress(overallPercent)
      }
    }

    return uploadToS3({ ...item, onProgress: internalOnProgress })
  })

  await Promise.all(uploadPromises)
}
