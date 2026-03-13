import { useTranslation } from 'react-i18next'
import { createElasticsearchTexts } from './elasticsearch.texts'

export const useElasticsearchText = () => {
  const { t } = useTranslation('admin-elasticsearch')
  return {
    text: createElasticsearchTexts(t),
    t
  }
}
