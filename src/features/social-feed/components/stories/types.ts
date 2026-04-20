// Shared display model for a Jamendo track (mapped from JamendoTrack)
export interface TrackDisplay {
  id: string
  title: string
  artist: string
  genre: string
  audio: string
  coverColor: string
  // Full metadata for persisting to backend
  coverUrl?: string
  duration?: number
  albumName?: string
}
