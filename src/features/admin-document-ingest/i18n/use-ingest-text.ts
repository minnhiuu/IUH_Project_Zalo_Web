import { useTranslation } from 'react-i18next'
import { INGEST_KEYS } from './ingest.keys'
import { createIngestTexts } from './ingest.texts'

export const useIngestText = () => {
  const { t } = useTranslation('ingest')

  return {
    t,
    keys: INGEST_KEYS,
    text: createIngestTexts(t)
  }
}
