import { useTranslation } from 'react-i18next'
import { FRIEND_KEYS } from './friend.keys'
import { createFriendTexts } from './friend.texts'

export const useFriendText = () => {
  const { t } = useTranslation('friend')
  const text = createFriendTexts(t)

  return {
    t,
    keys: FRIEND_KEYS,
    text,
    toast: text.toast
  }
}
