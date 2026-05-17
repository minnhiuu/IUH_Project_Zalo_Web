import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, Flag, Globe, MessageCircle, MoreHorizontal, Share2, ThumbsUp, Users, EyeOff, Edit2, Trash2, Lock } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PostCommentsModal } from './post-comments-modal'
import { PostMediaModal } from './post-media-modal'
import { ReactionPeopleModal } from './reaction-people-modal'
import { SharePostModal } from './share-post-modal'
import { REACTIONS, ReactionPicker, type ReactionType } from './reaction-picker'
import { MediaSection } from './media-section'
import { useSocialText } from '../../i18n/use-social-text'
import { useAuthContext } from '@/features/auth/context/auth-context'
import { PATHS } from '@/constants/path'
import { formatRelativeTime } from '@/utils/date'
import { useViewTracker } from '../../hooks/use-view-tracker'
import { commentApi } from '../../api/comment.api'
import { useDislikePostMutation, useDeleteSocialPostMutation } from '../../queries/use-mutations'
import { ReportContentDialog } from '@/features/report/components/report-content-dialog'
import { toast } from 'sonner'
import { PostComposer } from '../composer/post-composer'

export interface SocialPostMedia {
  url: string
  type: 'IMAGE' | 'VIDEO'
}

interface SharedPostPreview {
  postId: string
  authorId?: string | null
  authorName: string
  authorAvatar?: string | null
  content: string
  media?: SocialPostMedia[]
}

export interface SocialPost {
  id: string
  authorId?: string | null
  authorName: string
  authorAvatar?: string | null
  postType?: 'FEED' | 'STORY' | 'REEL' | 'SHARE'
  postedAt: string
  visibility: 'Public' | 'Friends' | 'Private'
  content: string
  media?: SocialPostMedia[]
  sharedPost?: SharedPostPreview | null
  reactions: number
  topReactions?: ReactionType[]
  comments: number
  shares: number
  views?: number
  rootPostId?: string | null
  currentUserReaction?: ReactionType | null
}

interface PostCardProps {
  post: SocialPost
  hideLikeShare?: boolean
}

export function PostCard({ post, hideLikeShare }: PostCardProps) {
  const navigate = useNavigate()
  const { user: me } = useAuthContext()
  const { text, language } = useSocialText()
  const { ref: viewRef } = useViewTracker(post.id)
  const { mutate: dislikePost } = useDislikePostMutation()
  const { mutate: deletePost } = useDeleteSocialPostMutation()
  const [isHidden, setIsHidden] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    (post.currentUserReaction as ReactionType) ?? null
  )
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [commentsModalOpen, setCommentsModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [reactionPeopleModalOpen, setReactionPeopleModalOpen] = useState(false)
  const [localCommentCountOffset, setLocalCommentCountOffset] = useState(0)
  
  const displayedCommentsCount = Math.max(0, post.comments + localCommentCountOffset)
  
  const [mediaModalState, setMediaModalState] = useState<{
    open: boolean
    initialSlide: number
    media: SocialPostMedia[]
  }>({
    open: false,
    initialSlide: 0,
    media: post.media ?? []
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  const VisibilityIcon = post.visibility === 'Friends' ? Users : post.visibility === 'Private' ? Lock : Globe
  const activeReaction = selectedReaction ? REACTIONS.find((reaction) => reaction.type === selectedReaction) : null
  const hadReactionOnLoad = Boolean(post.currentUserReaction)
  const reactionsCount =
    post.reactions +
    (!hadReactionOnLoad && selectedReaction ? 1 : 0) +
    (hadReactionOnLoad && !selectedReaction ? -1 : 0)
  const displayedTopReactions =
    selectedReaction && !post.topReactions?.includes(selectedReaction)
      ? [selectedReaction, ...(post.topReactions ?? []).slice(0, 2)]
      : (post.topReactions ?? []).slice(0, 3)
  const topReactionOptions = displayedTopReactions
    .map((type) => REACTIONS.find((reaction) => reaction.type === type))
    .filter((reaction): reaction is (typeof REACTIONS)[number] => Boolean(reaction))
  const visibilityLabel = post.visibility === 'Friends' ? text.post.visibility.Friends : post.visibility === 'Private' ? text.post.visibility.Private : text.post.visibility.Public
  const defaultPostedAtLabel = text.post.justNow
  const postedAtLabel = formatRelativeTime(post.postedAt, language) || defaultPostedAtLabel
  const canShare = !hideLikeShare && post.authorId !== me?.id && post.sharedPost?.authorId !== me?.id

  const toggleMutation = useMutation({
    mutationFn: (type: ReactionType) => commentApi.toggleReaction({ targetId: post.id, targetType: 'POST', type })
  })

  const deleteMutation = useMutation({
    mutationFn: () => commentApi.deleteReaction(post.id, 'POST')
  })

  function handleNotInterested() {
    setIsHidden(true)
    dislikePost(post.id, {
      onError: () => {
        setIsHidden(false)
        toast.error('Failed to hide post')
      }
    })
  }

  function handleDeletePost() {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id, {
        onSuccess: () => {
          toast.success('Post deleted successfully')
        },
        onError: () => {
          toast.error('Failed to delete post')
        }
      })
    }
  }

  function handleReactionClick(type: ReactionType) {
    setShowReactionPicker(false)
    if (selectedReaction === type) {
      setSelectedReaction(null)
      deleteMutation.mutate()
      return
    }
    setSelectedReaction(type)
    toggleMutation.mutate(type)
  }

  function handleMediaClick(index: number, mediaSource: SocialPostMedia[]) {
    setMediaModalState({
      open: true,
      initialSlide: index,
      media: mediaSource
    })
  }

  function handleAuthorClick() {
    if (!post.authorId) return
    if (me?.id && post.authorId === me.id) {
      navigate(PATHS.USER.PROFILE)
    } else {
      navigate(PATHS.USER.OTHER_PROFILE.replace(':userId', post.authorId))
    }
  }

  function handleSharedAuthorClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!post.sharedPost?.authorId) return
    if (me?.id && post.sharedPost.authorId === me.id) {
      navigate(PATHS.USER.PROFILE)
    } else {
      navigate(PATHS.USER.OTHER_PROFILE.replace(':userId', post.sharedPost.authorId))
    }
  }

  if (isHidden) {
    return (
      <Card className='gap-0 py-0 overflow-visible rounded-none sm:rounded-2xl border-x-0 sm:border-x border-y border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#09090b]/80'>
        <CardContent className='flex items-center justify-between px-4 sm:px-6 py-6'>
          <div className='flex items-center gap-3 text-zinc-500 dark:text-zinc-400'>
            <EyeOff className='h-5 w-5' />
            <span className='text-[14px] font-medium'>Post hidden — we&apos;ll show fewer like this</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={viewRef}
      className='gap-0 py-0 overflow-visible rounded-none sm:rounded-2xl border-x-0 sm:border-x border-y border-white bg-white/70 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#09090b]/80 dark:backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:hover:bg-[#121212]/90'
    >
      <CardHeader className='flex flex-row items-start justify-between px-4 sm:px-6 py-4 sm:py-5'>
        <div className='flex items-center gap-4'>
          <button
            onClick={handleAuthorClick}
            className='transition-transform hover:scale-105 active:scale-95'
          >
            <div className='h-11 w-11 shadow-sm rounded-full'>
              <UserAvatar
                name={post.authorName}
                src={post.authorAvatar}
                className='w-full h-full border-2 border-white dark:border-zinc-800'
                fallbackClassName='bg-primary'
              />
            </div>
          </button>
          <div>
            <button
              onClick={handleAuthorClick}
              className='text-[15px] font-semibold text-zinc-900 dark:text-[#ececec] tracking-tight hover:text-[#0068ff] dark:hover:text-blue-400 hover:underline'
            >
              {post.authorName}
            </button>
            {post.postType === 'SHARE' ? (
              <p className='text-[12px] font-medium text-zinc-500 dark:text-zinc-400'>{text.post.sharedAPost}</p>
            ) : null}
            <div className='mt-0.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-500'>
              <span>{postedAtLabel}</span>
              <div className='flex items-center gap-1 rounded' title={visibilityLabel}>
                <VisibilityIcon className='h-3.5 w-3.5' />
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon-sm'
              className='rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-300'
            >
              <MoreHorizontal className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            {post.authorId === me?.id && (
              <>
                <DropdownMenuItem onClick={() => setIsEditing(true)} className='gap-2 text-[13.5px]'>
                  <Edit2 className='h-4 w-4' />
                  Edit post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeletePost} className='gap-2 text-[13.5px] text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400'>
                  <Trash2 className='h-4 w-4' />
                  Delete post
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={handleNotInterested} className='gap-2 text-[13.5px]'>
              <EyeOff className='h-4 w-4' />
              Not interested
            </DropdownMenuItem>
            {post.authorId === me?.id && (
              <DropdownMenuItem
                onClick={() => {
                  toast.promise(commentApi.simulateBatchLikes(post.id, 50), {
                    loading: 'Simulating 50 likes...',
                    success: 'Successfully queued 50 like notifications!',
                    error: 'Failed to simulate likes'
                  })
                }}
                className='gap-2 text-[13.5px] text-amber-600 dark:text-amber-400 focus:text-amber-600 dark:focus:text-amber-400'
              >
                <ThumbsUp className='h-4 w-4' />
                Simulate 50 Likes
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setReportDialogOpen(true)}
              className='gap-2 text-[13.5px] text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400'
            >
              <Flag className='h-4 w-4' />
              Report post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className='space-y-4 px-4 sm:px-6 pb-4'>
        <div>
          <p
            className={`wrap-break-word text-[15px] leading-relaxed tracking-wide whitespace-pre-line text-zinc-800 dark:text-zinc-200 transition-all duration-300 ${!isExpanded && post.content?.length > 150 ? 'line-clamp-3' : ''}`}
          >
            {post.content}
          </p>
          {post.content?.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='mt-2 text-[14px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors'
            >
              {isExpanded ? text.post.showLess || 'Show less' : text.post.readMore || 'Read more'}
            </button>
          )}
        </div>

        {post.postType === 'SHARE' && post.sharedPost ? (
          <div className='rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900/40'>
            <div className='mb-2 flex items-center gap-2'>
              <button
                onClick={handleSharedAuthorClick}
                disabled={!post.sharedPost.authorId}
                className={`h-8 w-8 ${post.sharedPost.authorId ? 'transition-transform hover:scale-105 active:scale-95' : ''}`}
              >
                <UserAvatar
                  name={post.sharedPost.authorName}
                  src={post.sharedPost.authorAvatar}
                  className='w-full h-full border border-background'
                  fallbackClassName='bg-primary text-white text-xs font-semibold'
                />
              </button>
              <button
                onClick={handleSharedAuthorClick}
                disabled={!post.sharedPost.authorId}
                className={`text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 ${post.sharedPost.authorId ? 'hover:text-primary dark:hover:text-primary hover:underline' : ''}`}
              >
                {post.sharedPost.authorName}
              </button>
            </div>

            {post.sharedPost.content ? (
              <p className='wrap-break-word text-[14px] leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300'>
                {post.sharedPost.content}
              </p>
            ) : null}

            {post.sharedPost.media && post.sharedPost.media.length > 0 ? (
              <MediaSection
                media={post.sharedPost.media}
                attachmentAlt={text.post.attachmentAlt(post.sharedPost.authorName)}
                onMediaClick={(index) => handleMediaClick(index, post.sharedPost?.media ?? [])}
              />
            ) : null}
          </div>
        ) : null}

        {post.media && post.media.length > 0 && (
          <MediaSection
            media={post.media}
            attachmentAlt={text.post.attachmentAlt(post.authorName)}
            onMediaClick={(index) => handleMediaClick(index, post.media ?? [])}
          />
        )}

        <div className='flex items-center justify-between pt-3 text-[13px] font-medium text-zinc-500 dark:text-zinc-400'>
          {reactionsCount > 0 ? (
            <button
              type='button'
              onClick={() => setReactionPeopleModalOpen(true)}
              className='flex items-center gap-2.5 rounded-md transition-colors hover:text-primary dark:hover:text-primary'
            >
              {topReactionOptions.length > 0 ? (
                <div className='flex items-center'>
                  {topReactionOptions.map((reaction, index) => (
                    <div
                      key={`${reaction.type}-${index}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border border-white bg-zinc-100 text-[13px] leading-none dark:border-zinc-900 dark:bg-zinc-800 ${index > 0 ? '-ml-2' : ''}`}
                      title={text.reactions.labels[reaction.type]}
                    >
                      <reaction.Icon size={16} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20'>
                  {activeReaction ? (
                    <span className='text-xs'>{activeReaction.emoji}</span>
                  ) : (
                    <ThumbsUp className='h-3.5 w-3.5 fill-primary text-primary' />
                  )}
                </div>
              )}
              <span className='text-[15px] font-semibold text-zinc-700 dark:text-zinc-200'>{reactionsCount}</span>
            </button>
          ) : (
            <div />
          )}
          <div className='flex items-center gap-3'>
            {displayedCommentsCount > 0 && (
              <button
                type='button'
                className='cursor-pointer transition-colors hover:text-primary'
                onClick={() => setCommentsModalOpen(true)}
              >
                {text.post.commentCount(displayedCommentsCount)}
              </button>
            )}
            {post.shares > 0 && (
              <span className='hover:text-primary cursor-pointer transition-colors'>
                {text.post.shareCount(post.shares)}
              </span>
            )}
            {post.postType === 'REEL' && post.views !== undefined && post.views > 0 && (
              <span className='flex items-center gap-1 text-zinc-400 dark:text-zinc-500'>
                <Eye className='h-3.5 w-3.5' />
                {post.views}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex flex-col gap-0 border-t border-zinc-200 dark:border-white/5 px-2 sm:px-4 py-2 sm:py-3'>
        <div className='flex w-full gap-1 sm:gap-2'>
          {!hideLikeShare && (
            <div
              className='relative flex-1'
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              <ReactionPicker open={showReactionPicker} onSelect={handleReactionClick} />

              <Button
                variant='ghost'
                className={`h-11 w-full gap-2 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04] ${activeReaction ? activeReaction.textClass : 'text-zinc-500 dark:text-zinc-400 hover:text-[#0068ff] dark:hover:text-blue-400'}`}
                onClick={() => {
                  if (selectedReaction) {
                    setSelectedReaction(null)
                    deleteMutation.mutate()
                    return
                  }
                  handleReactionClick('LIKE')
                }}
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  animate={selectedReaction ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {activeReaction ? (
                    <activeReaction.Icon size={24} />
                  ) : (
                    <ThumbsUp className='h-4.5 w-4.5 transition-colors' />
                  )}
                </motion.div>
                <span className='text-[14px] font-semibold'>
                  {activeReaction ? text.reactions.labels[activeReaction.type] : text.reactions.labels.LIKE}
                </span>
              </Button>
            </div>
          )}
          <Button
            variant='ghost'
            className='h-11 flex-1 gap-2 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-[#0068ff] dark:hover:text-blue-400'
            onClick={() => setCommentsModalOpen(true)}
          >
            <MessageCircle className='h-4.5 w-4.5' />
            <span className='text-[14px] font-semibold'>{text.post.comment}</span>
          </Button>
          {canShare && (
            <Button
              variant='ghost'
              className='h-11 flex-1 gap-2 rounded-xl text-zinc-500 dark:text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-[#0068ff] dark:hover:text-blue-400'
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className='h-4.5 w-4.5' />
              <span className='text-[14px] font-semibold'>{text.post.share}</span>
            </Button>
          )}
        </div>
      </CardFooter>

      {commentsModalOpen && (
        <PostCommentsModal
          open={commentsModalOpen}
          onOpenChange={setCommentsModalOpen}
          post={post}
          hideLikeShare={hideLikeShare}
          currentReaction={selectedReaction}
          onReactionChange={(type) => {
            if (type === null) {
              setSelectedReaction(null)
              deleteMutation.mutate()
            } else {
              handleReactionClick(type)
            }
          }}
          onCommentAdded={() => setLocalCommentCountOffset(c => c + 1)}
          onCommentDeleted={() => setLocalCommentCountOffset(c => c - 1)}
        />
      )}
      {reactionPeopleModalOpen && (
        <ReactionPeopleModal
          open={reactionPeopleModalOpen}
          onOpenChange={setReactionPeopleModalOpen}
          targetId={post.id}
          targetType='POST'
          initialReactionType={topReactionOptions[0]?.type ?? 'LIKE'}
        />
      )}
      {shareModalOpen && <SharePostModal open={shareModalOpen} onOpenChange={setShareModalOpen} post={post} />}
      <ReportContentDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        targetId={post.id}
        targetType='POST'
      />
      {mediaModalState.open && (
        <PostMediaModal
          open={mediaModalState.open}
          onOpenChange={(open) =>
            setMediaModalState((previous) => ({
              ...previous,
              open
            }))
          }
          post={post}
          initialSlide={mediaModalState.initialSlide}
          mediaOverride={mediaModalState.media}
          hideLikeShare={hideLikeShare}
          currentReaction={selectedReaction}
          onReactionChange={(type) => {
            if (type === null) {
              setSelectedReaction(null)
              deleteMutation.mutate()
            } else {
              handleReactionClick(type)
            }
          }}
          onCommentAdded={() => setLocalCommentCountOffset(c => c + 1)}
          onCommentDeleted={() => setLocalCommentCountOffset(c => c - 1)}
        />
      )}

      <PostComposer
        open={isEditing}
        onOpenChange={setIsEditing}
        initialPost={post}
        onPostSuccess={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    </Card>
  )
}
