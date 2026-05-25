// Jamendo API v3.0 — https://developer.jamendo.com/v3.0/tracks
// Requires VITE_JAMENDO_CLIENT_ID in your .env file

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0'
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string | undefined

// ─── Jamendo genre tag map ────────────────────────────────────────────────────
// Maps UI genre labels to Jamendo's curated tag selections
export const JAMENDO_GENRE_TAGS: Record<string, string> = {
  'Lo-fi': 'lofi',
  Pop: 'pop',
  Acoustic: 'acoustic',
  Electronic: 'electronic',
  Classical: 'classical'
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface JamendoTrack {
  id: string
  name: string
  duration: number
  artist_name: string
  album_name: string
  album_image: string
  image: string
  audio: string
  audiodownload: string
  audiodownload_allowed: boolean
  musicinfo?: {
    tags?: {
      genres?: string[]
    }
  }
}

interface JamendoResponse {
  headers: {
    status: string
    code: number
    error_message: string
    results_count: number
  }
  results: JamendoTrack[]
}

// ─── Palette for cover art colour (deterministic from track ID) ───────────────
const COVER_PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#3b82f6', '#f97316'
]

export function coverColorFromId(id: string): string {
  const num = parseInt(id, 10) || 0
  return COVER_PALETTE[num % COVER_PALETTE.length]
}

// ─── API call ─────────────────────────────────────────────────────────────────

export interface FetchTracksParams {
  genre?: string   // UI genre label e.g. 'Lo-fi'  (undefined = All)
  limit?: number
}

export async function fetchJamendoTracks({ genre, limit = 20 }: FetchTracksParams = {}): Promise<JamendoTrack[]> {
  if (!CLIENT_ID) {
    throw new Error('VITE_JAMENDO_CLIENT_ID is not set')
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    limit: String(limit),
    include: 'musicinfo',
    vocalinstrumental: 'instrumental',  // background music — no vocals
    audioformat: 'mp31',
    order: 'popularity_total',
    featured: '1',
    imagesize: '100'
  })

  // Map UI genre → Jamendo tag
  const jamendoTag = genre ? JAMENDO_GENRE_TAGS[genre] : undefined
  if (jamendoTag) {
    params.set('tags', jamendoTag)
  }

  const res = await fetch(`${JAMENDO_BASE}/tracks/?${params.toString()}`)
  if (!res.ok) throw new Error(`Jamendo API error: ${res.status}`)

  const data: JamendoResponse = await res.json()

  if (data.headers.code !== 0) {
    throw new Error(`Jamendo API: ${data.headers.error_message}`)
  }

  // Filter out tracks with no streamable audio
  return data.results.filter((t) => !!t.audio)
}
