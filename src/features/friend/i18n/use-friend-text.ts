import { useTranslation } from 'react-i18next'
import { FRIEND_KEYS } from './friend.keys'
import { createFriendTexts } from './friend.texts'

export const useFriendText = () => {
  const { t } = useTranslation('friend')

  return {
    t,
    keys: FRIEND_KEYS,
    text: createFriendTexts(t)
  }
}
