// Genre labels shown in the music picker pills.
// 'All' fetches without a genre filter; others map to Jamendo tags via JAMENDO_GENRE_TAGS.
export const MUSIC_GENRES = ['All', 'Lo-fi', 'Pop', 'Acoustic', 'Electronic', 'Classical'] as const

export type MusicGenre = (typeof MUSIC_GENRES)[number]
