import { useTranslation } from 'react-i18next'
import { CHAT_KEYS } from './chat.keys'
import { createChatTexts } from './chat.texts'

export const useChatText = () => {
  const { t, i18n } = useTranslation('chat')

  return {
    t,
    i18n,
    keys: CHAT_KEYS,
    text: createChatTexts(t)
  }
}
