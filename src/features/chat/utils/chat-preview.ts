import { MessageType, MessageStatus } from '@/constants/enum'

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
  } else if (!displayContent && data.type === MessageType.Image) {
    displayContent = text.type.image
  } else if (data.content && LEGACY_IMAGE_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.image
  } else if (!displayContent && data.type === MessageType.Video) {
    displayContent = text.type.video || '[Video]'
  } else if (data.content && LEGACY_VIDEO_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.video || '[Video]'
  } else if (!displayContent && data.type === MessageType.File) {
    displayContent = text.type.file
  } else if (data.content && LEGACY_FILE_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.file
  } else if (!displayContent && data.type === MessageType.Link) {
    displayContent = text.type.link
  } else if (data.content && LEGACY_LINK_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.link
  }

  if (isRevoked || !prefix) {
    return displayContent
  }

  return `${prefix}: ${displayContent}`
}
