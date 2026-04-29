import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useSocialText } from '../../i18n/use-social-text'
import { useStoryComposer } from './hooks/use-story-composer'
import { StoryCanvas } from './components/story-canvas'
import { StoryControlPanel } from './components/story-control-panel'

interface StoryComposerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoryComposerModal({ open, onOpenChange }: StoryComposerModalProps) {
  const { text } = useSocialText()
  const composer = useStoryComposer(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        aria-describedby={undefined}
        className='top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-none bg-transparent p-0 text-white sm:h-dvh sm:w-screen sm:max-w-none'
      >
        <DialogTitle className='sr-only'>{text.storyComposer.title}</DialogTitle>

        {/* Root layout */}
        <div className='flex h-full w-full overflow-hidden bg-zinc-950 dark:bg-[#0a0a0f]'>
          {/* Left: immersive story canvas */}
          <StoryCanvas
            mediaPreviewUrl={composer.mediaPreviewUrl}
            mediaType={composer.mediaType}
            profileName={composer.profileName}
            profileAvatar={composer.profileAvatar}
            caption={composer.caption}
            selectedTrack={composer.selectedTrack}
            onClearMedia={composer.clearMedia}
            onPickImage={() => composer.imageInputRef.current?.click()}
            onPickVideo={() => composer.videoInputRef.current?.click()}
          />

          {/* Right: control panel */}
          <StoryControlPanel
            profileName={composer.profileName}
            profileAvatar={composer.profileAvatar}
            visibility={composer.visibility}
            onVisibilityChange={composer.setVisibility}
            mediaType={composer.mediaType}
            onPickImage={() => composer.imageInputRef.current?.click()}
            onPickVideo={() => composer.videoInputRef.current?.click()}
            isImage={composer.isImage}
            caption={composer.caption}
            onCaptionChange={composer.setCaption}
            showMusicPicker={composer.showMusicPicker}
            onToggleMusicPicker={composer.toggleMusicPicker}
            selectedTrack={composer.selectedTrack}
            selectedTrackId={composer.selectedTrackId}
            playingTrackId={composer.playingTrackId}
            genreFilter={composer.genreFilter}
            onGenreChange={composer.setGenreFilter}
            isMusicMuted={composer.isMusicMuted}
            onToggleMute={composer.handleToggleMusicMute}
            tracks={composer.tracks}
            isLoadingTracks={composer.isLoadingTracks}
            isTracksError={composer.isTracksError}
            onSelectTrack={composer.handleSelectTrack}
            onTogglePlay={composer.handleTogglePlay}
            canPost={!!composer.mediaFile}
            isPending={composer.isPending}
            onPost={composer.handlePost}
          />
        </div>

        {/* Hidden file inputs */}
        <input
          ref={composer.imageInputRef}
          type='file'
          accept='image/png,image/jpeg,image/jpg,image/webp,image/gif'
          className='hidden'
          onChange={composer.onPickImage}
        />
        <input
          ref={composer.videoInputRef}
          type='file'
          accept='video/*'
          className='hidden'
          onChange={composer.onPickVideo}
        />
      </DialogContent>
    </Dialog>
  )
}
