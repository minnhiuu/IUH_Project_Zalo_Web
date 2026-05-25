import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { useMyProfile } from '@/features/user/queries/use-queries'
import { useCreateSocialPostMutation } from '../../../queries/use-mutations'
import { useJamendoTracks } from '../../../queries/use-jamendo-tracks'
import { coverColorFromId } from '../../../api/jamendo.api'
import { fileApi } from '../../../api/file.api'
import { useSocialText } from '../../../i18n/use-social-text'
import type { VisibilityType } from '../../composer/visibility-dropdown'
import type { TrackDisplay } from '../types'
import { extractHashtags } from '@/utils/hashtag'

export interface StoryComposerState {
  // ─── Profile ──────────────────────────────────────────────────────────────
  profileName: string
  profileAvatar: string

  // ─── Media ────────────────────────────────────────────────────────────────
  mediaFile: File | null
  mediaType: 'IMAGE' | 'VIDEO' | null
  mediaPreviewUrl: string | null
  imageInputRef: React.RefObject<HTMLInputElement | null>
  videoInputRef: React.RefObject<HTMLInputElement | null>
  onPickImage: (e: ChangeEvent<HTMLInputElement>) => void
  onPickVideo: (e: ChangeEvent<HTMLInputElement>) => void
  clearMedia: () => void
  isImage: boolean

  // ─── Caption ──────────────────────────────────────────────────────────────
  caption: string
  setCaption: React.Dispatch<React.SetStateAction<string>>

  // ─── Visibility ───────────────────────────────────────────────────────────
  visibility: VisibilityType
  setVisibility: React.Dispatch<React.SetStateAction<VisibilityType>>

  // ─── Music ────────────────────────────────────────────────────────────────
  showMusicPicker: boolean
  toggleMusicPicker: () => void
  selectedTrackId: string | null
  selectedTrack: TrackDisplay | null
  playingTrackId: string | null
  genreFilter: string
  setGenreFilter: React.Dispatch<React.SetStateAction<string>>
  isMusicMuted: boolean
  tracks: TrackDisplay[]
  isLoadingTracks: boolean
  isTracksError: boolean
  handleSelectTrack: (id: string) => void
  handleTogglePlay: (id: string, audioUrl: string) => void
  handleToggleMusicMute: () => void

  // ─── Submit ───────────────────────────────────────────────────────────────
  handlePost: () => Promise<boolean>
  isPending: boolean
}

export function useStoryComposer(open: boolean): StoryComposerState {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const { mutateAsync: createPost, isPending } = useCreateSocialPostMutation()

  const profileName = myProfile?.fullName?.trim() || text.composer.me
  const profileAvatar = myProfile?.avatar || ''

  // ─── Media ────────────────────────────────────────────────────────────────
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | null>(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  // ─── Caption / Visibility ─────────────────────────────────────────────────
  const [caption, setCaption] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('ALL')

  // ─── Music ────────────────────────────────────────────────────────────────
  const [showMusicPicker, setShowMusicPicker] = useState(false)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [genreFilter, setGenreFilter] = useState('All')
  const [isMusicMuted, setIsMusicMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ─── Derived ──────────────────────────────────────────────────────────────
  const isImage = mediaType === 'IMAGE'

  // ─── Jamendo ──────────────────────────────────────────────────────────────
  const {
    data: jamendoData,
    isLoading: isLoadingTracks,
    isError: isTracksError
  } = useJamendoTracks({
    genre: genreFilter === 'All' ? undefined : genreFilter,
    limit: 20,
    enabled: showMusicPicker && isImage
  })

  const tracks: TrackDisplay[] = (jamendoData ?? []).map((t) => ({
    id: t.id,
    title: t.name,
    artist: t.artist_name,
    genre: t.musicinfo?.tags?.genres?.[0] ?? '',
    audio: t.audio,
    coverColor: coverColorFromId(t.id),
    coverUrl: t.album_image || t.image || undefined,
    duration: t.duration || undefined,
    albumName: t.album_name || undefined
  }))

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? null

  // ─── Reset on close ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl)
      audioRef.current?.pause()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMediaFile(null)
      setMediaType(null)
      setMediaPreviewUrl(null)
      setCaption('')
      setVisibility('ALL')
      setShowMusicPicker(false)
      setSelectedTrackId(null)
      setPlayingTrackId(null)
      setGenreFilter('All')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop preview when picker closes
  useEffect(() => {
    if (!showMusicPicker) {
      audioRef.current?.pause()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayingTrackId(null)
    }
  }, [showMusicPicker])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const pickMedia = (file: File, type: 'IMAGE' | 'VIDEO') => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl)
    setMediaFile(file)
    setMediaType(type)
    setMediaPreviewUrl(URL.createObjectURL(file))
    if (type === 'VIDEO') {
      setSelectedTrackId(null)
      setShowMusicPicker(false)
    }
  }

  const onPickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith('image/')) pickMedia(file, 'IMAGE')
    e.currentTarget.value = ''
  }

  const onPickVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith('video/')) pickMedia(file, 'VIDEO')
    e.currentTarget.value = ''
  }

  const clearMedia = () => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl)
    audioRef.current?.pause()
    setMediaFile(null)
    setMediaType(null)
    setMediaPreviewUrl(null)
    setSelectedTrackId(null)
    setPlayingTrackId(null)
    setShowMusicPicker(false)
  }

  const toggleMusicPicker = () => setShowMusicPicker((prev) => !prev)

  const handleSelectTrack = (id: string) => {
    setSelectedTrackId((prev) => (prev === id ? null : id))
  }

  const handleTogglePlay = (trackId: string, audioUrl: string) => {
    if (playingTrackId === trackId) {
      audioRef.current?.pause()
      setPlayingTrackId(null)
    } else {
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.pause()
      audioRef.current.src = audioUrl
      audioRef.current.volume = isMusicMuted ? 0 : 0.7
      audioRef.current.loop = true
      audioRef.current.play().catch(() => toast.error('Could not load audio preview'))
      setPlayingTrackId(trackId)
    }
  }

  const handleToggleMusicMute = () => {
    if (audioRef.current) audioRef.current.volume = isMusicMuted ? 0.7 : 0
    setIsMusicMuted((prev) => !prev)
  }

  const handlePost = async (): Promise<boolean> => {
    if (!mediaFile) return false
    try {
      const response = await fileApi.upload(mediaFile)
      const key = response.data.data.key
      
      const trimmedCaption = caption.trim()
      const hashtags = extractHashtags(trimmedCaption)
      
      await createPost({
        postType: 'STORY',
        visibility,
        caption: trimmedCaption || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        music: selectedTrack
          ? {
              jamendoId: selectedTrack.id,
              title: selectedTrack.title,
              artistName: selectedTrack.artist,
              audioUrl: selectedTrack.audio,
              coverUrl: selectedTrack.coverUrl ?? undefined,
              duration: selectedTrack.duration ?? undefined,
              albumName: selectedTrack.albumName ?? undefined
            }
          : undefined,
        media: [{ url: key, type: mediaType! }]
      })
      toast.success(text.storyComposer.successToast)
      return true
    } catch {
      toast.error(text.storyComposer.errorToast)
      return false
    }
  }

  return {
    profileName,
    profileAvatar,
    mediaFile,
    mediaType,
    mediaPreviewUrl,
    imageInputRef,
    videoInputRef,
    onPickImage,
    onPickVideo,
    clearMedia,
    isImage,
    caption,
    setCaption,
    visibility,
    setVisibility,
    showMusicPicker,
    toggleMusicPicker,
    selectedTrackId,
    selectedTrack,
    playingTrackId,
    genreFilter,
    setGenreFilter,
    isMusicMuted,
    tracks,
    isLoadingTracks,
    isTracksError,
    handleSelectTrack,
    handleTogglePlay,
    handleToggleMusicMute,
    handlePost,
    isPending
  }
}
