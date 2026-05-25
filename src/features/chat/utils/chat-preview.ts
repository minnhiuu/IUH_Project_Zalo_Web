import { MessageType, MessageStatus } from '@/constants/enum'
import { parseBusinessCardContent } from './business-card'

interface PreviewData {
  content?: string | null
  isFromMe?: boolean | null
  isGroup?: boolean | null
  senderName?: string | null
  type?: MessageType | null
  status?: MessageStatus | null
}

const LEGACY_IMAGE_PLACEHOLDERS = new Set(['[IMAGE]'])
const LEGACY_VIDEO_PLACEHOLDERS = new Set(['[VIDEO]'])
const LEGACY_FILE_PLACEHOLDERS = new Set(['[FILE]'])
const LEGACY_LINK_PLACEHOLDERS = new Set(['[LINK]'])

export const formatPreview = (
  data: PreviewData,
  text: {
    you: string
    user: string
    type: { image: string; video?: string; file: string; link: string }
    messageBubble: { revoked: string }
    businessCard: { preview: string }
  }
) => {
  if (!data.status && !data.content && !data.type) return ''

  // 1. Determine prefix
  const isRevoked = data.status === MessageStatus.REVOKED
  const prefix = isRevoked ? '' : data.isFromMe ? text.you : data.isGroup ? data.senderName || text.user : ''

  // 2. Determine display content
  let displayContent = data.content || ''
  if (isRevoked) {
    displayContent = text.messageBubble.revoked
  } else {
    if (data.content?.startsWith('[GROUP_CALL]::')) {
      try {
        const payload = JSON.parse(data.content.slice('[GROUP_CALL]::'.length))
        displayContent = payload.status === 'active' ? 'Cuộc gọi nhóm đang diễn ra...' : 'Cuộc gọi nhóm đã kết thúc'
      } catch {
        displayContent = 'Cuộc gọi nhóm'
      }
    } else {
      const businessCard = parseBusinessCardContent(data.content)
      if (businessCard) {
        displayContent = text.businessCard.preview.replace('{{name}}', businessCard.name)
      } else if (data.type === MessageType.Image || data.content === '[IMAGE]') {
        displayContent = text.type.image
      } else if (data.type === MessageType.File || data.content === '[FILE]') {
        displayContent = text.type.file
      } else if (data.type === MessageType.Link || data.content === '[LINK]') {
        displayContent = text.type.link
      }
    }
  }

  if (isRevoked || !prefix) {
    return displayContent
  }

  return `${prefix}: ${displayContent}`
}
