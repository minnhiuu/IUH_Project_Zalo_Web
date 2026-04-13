import { useQuery } from '@tanstack/react-query'
import { fetchJamendoTracks, type FetchTracksParams } from '../api/jamendo.api'

interface UseJamendoTracksOptions extends FetchTracksParams {
  enabled?: boolean
}

export function useJamendoTracks({ enabled = true, ...params }: UseJamendoTracksOptions = {}) {
  return useQuery({
    queryKey: ['jamendo-tracks', params.genre ?? 'All', params.limit ?? 20],
    queryFn: () => fetchJamendoTracks(params),
    enabled,
    staleTime: 1000 * 60 * 10, // cache for 10 min
    retry: 1
  })
}
