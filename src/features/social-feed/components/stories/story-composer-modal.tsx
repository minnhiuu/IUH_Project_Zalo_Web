import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { BaseDialog } from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
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
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const handleCloseAttempt = () => {
    if (composer.mediaFile || composer.caption.trim()) {
      setShowDiscardConfirm(true)
    } else {
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseAttempt}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className='fixed top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-none bg-transparent p-0 text-white sm:h-dvh sm:w-screen sm:max-w-none z-[110]'
        >
          <DialogTitle className='sr-only'>{text.storyComposer.title}</DialogTitle>

          {/* Root layout */}
          <div className='flex h-full w-full overflow-hidden bg-[#f0f2f5] dark:bg-[#0a0a0f] relative'>
            {/* Left: control panel (Sidebar) */}
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
              onPost={async () => {
                const success = await composer.handlePost()
                if (success) {
                  onOpenChange(false)
                }
              }}
              onClose={handleCloseAttempt}
            />

            {/* Right: immersive story canvas (Preview) */}
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
              isPending={composer.isPending}
            />
          </div>

          {/* Hidden file inputs */}
          <input
            // eslint-disable-next-line react-hooks/refs
            ref={composer.imageInputRef}
            type='file'
            accept='image/png,image/jpeg,image/jpg,image/webp,image/gif'
            className='hidden'
            // eslint-disable-next-line react-hooks/refs
            onChange={composer.onPickImage}
          />
          <input
            // eslint-disable-next-line react-hooks/refs
            ref={composer.videoInputRef}
            type='file'
            accept='video/*'
            className='hidden'
            // eslint-disable-next-line react-hooks/refs
            onChange={composer.onPickVideo}
          />
        </DialogContent>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <BaseDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={text.storyComposer.discardConfirmTitle}
        className='sm:max-w-[500px]'
      >
        <div className='flex flex-col gap-8 px-1 pb-2'>
          <p className='text-[15px] font-medium leading-relaxed text-zinc-600 dark:text-zinc-400'>
            {text.storyComposer.discardConfirmMsg}
          </p>
          <div className='flex items-center justify-end gap-2'>
            <Button
              variant='ghost'
              onClick={() => setShowDiscardConfirm(false)}
              className='h-11 rounded-lg px-6 text-[15px] font-bold text-[#0068ff] transition-colors hover:bg-blue-50 hover:text-[#005ae0] dark:hover:bg-blue-500/10'
            >
              {text.storyComposer.continueEditing}
            </Button>
            <Button
              onClick={() => {
                setShowDiscardConfirm(false)
                onOpenChange(false)
              }}
              className='h-10 min-w-[100px] rounded-lg bg-[#0068ff] px-8 text-[15px] font-bold text-white shadow-md transition-all hover:bg-[#005ae0] active:scale-95'
            >
              {text.storyComposer.discard}
            </Button>
          </div>
        </div>
      </BaseDialog>
    </>
  )
}
