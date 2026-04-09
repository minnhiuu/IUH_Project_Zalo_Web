import { useTranslation } from 'react-i18next'
import { CHAT_KEYS } from './chat.keys'
import { createChatTexts } from './chat.texts'

export const useChatText = () => {
  const { t } = useTranslation('chat')

  return {
    t,
    keys: CHAT_KEYS,
    text: createChatTexts(t)
  }
}
