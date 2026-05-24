const HASHTAG_REGEX = /(^|\s)#([\p{L}\p{N}_]+)/gu

export const extractHashtags = (value: string): string[] => {
  const hashtags: string[] = []
  const seen = new Set<string>()

  for (const match of value.matchAll(HASHTAG_REGEX)) {
    const rawTag = match[2]?.trim()
    if (!rawTag) continue

    const normalizedTag = rawTag.toLowerCase()
    if (seen.has(normalizedTag)) continue

    seen.add(normalizedTag)
    hashtags.push(`#${rawTag}`)
  }

  return hashtags
}
