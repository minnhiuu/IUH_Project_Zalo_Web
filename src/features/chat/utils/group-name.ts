/**
 * Formats a list of member names into a default group name.
 * Shows the first 4 names and adds "and X others" if more exist.
 * Supports i18n by providing a translation function for the "and others" suffix.
 */
export const formatDefaultGroupName = (
  names: string[],
  andOthersText?: (count: number) => string
): string => {
  if (!names || names.length === 0) return ''

  if (names.length <= 4) {
    return names.join(', ')
  }

  const visibleNames = names.slice(0, 4).join(', ')
  const remainingCount = names.length - 4

  return andOthersText
    ? `${visibleNames} ${andOthersText(remainingCount)}`
    : `${visibleNames} và ${remainingCount} người khác`
}
