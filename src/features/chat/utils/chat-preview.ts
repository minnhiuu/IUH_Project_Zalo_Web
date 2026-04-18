import { MessageType, MessageStatus } from '@/constants/enum'

interface PreviewData {
  content?: string | null
  isFromMe?: boolean | null
  senderName?: string | null
  type?: MessageType | null
  status?: MessageStatus | null
}

export const formatPreview = (
  data: PreviewData,
  text: {
    you: string
    user: string
    type: { image: string; file: string; link: string }
    messageBubble: { revoked: string }
  }
) => {
  if (!data.status && !data.content && !data.type) return ''

  // 1. Determine prefix
  const isRevoked = data.status === MessageStatus.REVOKED
  const prefix = isRevoked ? '' : data.isFromMe ? text.you : data.senderName || text.user

  // 2. Determine display content
  let displayContent = data.content || ''
  if (isRevoked) {
    displayContent = text.messageBubble.revoked
  } else if (data.type === MessageType.Image || data.content === '[IMAGE]') {
    displayContent = text.type.image
  } else if (data.type === MessageType.File || data.content === '[FILE]') {
    displayContent = text.type.file
  } else if (data.type === MessageType.Link || data.content === '[LINK]') {
    displayContent = text.type.link
  }

  return isRevoked ? displayContent : `${prefix}: ${displayContent}`
}
