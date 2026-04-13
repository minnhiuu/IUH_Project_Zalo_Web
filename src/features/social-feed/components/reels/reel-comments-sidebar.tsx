import { useState } from 'react'
import { MessageCircle, X, Loader2, AlertCircle } from 'lucide-react'
import type { SocialPost } from '../post/post-card'
import { CommentInput } from '../comments/comment-input'
import { CommentItem } from '../comments/comment-item'
import { useSocialText } from '../../i18n/use-social-text'
import { useSocialFeedComments } from '../../queries/use-queries'
import {
  useCreateSocialCommentMutation,
  useDeleteSocialCommentMutation,
  useDeleteSocialCommentReactionMutation,
  useToggleSocialCommentReactionMutation,
  useUpdateSocialCommentMutation
} from '../../queries/use-mutations'
import type { SocialFeedComment, CommentMediaRequest } from '../../schemas/comment.schema'
import type { ReactionType } from '../post/reaction-picker'
import { useAuthContext } from '@/features/auth/context/auth-context'

interface ReelCommentsSidebarProps {
  post: SocialPost
  onClose: () => void
}

export function ReelCommentsSidebar({ post, onClose }: ReelCommentsSidebarProps) {
  const { text } = useSocialText()
  const { user } = useAuthContext()
  const commentsQuery = useSocialFeedComments(post.id, 0, 20)
  const createCommentMutation = useCreateSocialCommentMutation(post.id)
  const updateCommentMutation = useUpdateSocialCommentMutation(post.id)
  const deleteCommentMutation = useDeleteSocialCommentMutation(post.id)
  const toggleReactionMutation = useToggleSocialCommentReactionMutation(post.id)
  const deleteReactionMutation = useDeleteSocialCommentReactionMutation(post.id)

  const comments = commentsQuery.data?.comments ?? []
  const [replyTarget, setReplyTarget] = useState<SocialFeedComment | null>(null)

  const isMutating =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending ||
    toggleReactionMutation.isPending ||
    deleteReactionMutation.isPending

  async function handleCreateComment(content: string, parentId?: string, media?: CommentMediaRequest[]) {
    await createCommentMutation.mutateAsync({
      content,
      media,
      ...(parentId ? { parentId } : {})
    })

    setReplyTarget(null)
  }

  async function handleUpdateComment(commentId: string, content: string) {
    await updateCommentMutation.mutateAsync({
      commentId,
      payload: {
        content
      }
    })
  }

  async function handleDeleteComment(commentId: string) {
    await deleteCommentMutation.mutateAsync(commentId)
  }

  async function handleToggleCommentReaction(commentId: string, type: ReactionType) {
    await toggleReactionMutation.mutateAsync({
      commentId,
      type
    })
  }

  async function handleRemoveCommentReaction(commentId: string) {
    await deleteReactionMutation.mutateAsync(commentId)
  }

  return (
    <aside className='absolute right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border/30 bg-background/85 text-foreground shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-right-8 sm:w-[400px]'>
      <div className='flex h-full flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border/30 px-5 py-4'>
          <div className='flex flex-col gap-0.5'>
            <h2 className='text-lg font-bold tracking-tight'>{text.commentsModal.title}</h2>
            <p className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
              <span>{post.authorName}</span>
              <span className='h-1 w-1 rounded-full bg-muted-foreground/30'></span>
              <span>{text.commentsModal.commentCount(comments.length)}</span>
            </p>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95'
            aria-label={text.commentsModal.closeAriaLabel}
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className='flex flex-1 flex-col overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-muted/5'>
          {/* Post Caption Snippet View */}
          {post.content && (
            <div className='border-b border-border/20 bg-muted/20 px-5 py-4 transition-colors hover:bg-muted/30'>
              <p className='text-sm leading-relaxed tracking-wide text-foreground/90'>{post.content}</p>
            </div>
          )}

          {/* Comments List */}
          <div className='flex flex-col px-5 py-6'>
            {commentsQuery.isLoading ? (
              <div className='flex flex-col items-center justify-center space-y-4 py-12 opacity-80'>
                <div className='rounded-full bg-primary/10 p-3'>
                  <Loader2 className='h-7 w-7 animate-spin text-primary' />
                </div>
                <p className='text-sm font-medium text-muted-foreground'>{text.commentsModal.loadingComments}</p>
              </div>
            ) : commentsQuery.isError ? (
              <div className='flex flex-col items-center justify-center space-y-3 py-12 text-destructive/80'>
                <div className='rounded-full bg-destructive/10 p-3'>
                  <AlertCircle className='h-7 w-7' />
                </div>
                <p className='text-sm font-medium'>{text.commentsModal.loadError}</p>
              </div>
            ) : comments.length > 0 ? (
              <div className='flex flex-col gap-7'>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    currentUserId={user?.id}
                    isMutating={isMutating}
                    onReply={(selectedComment) => {
                      setReplyTarget(selectedComment)
                    }}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    onToggleReaction={handleToggleCommentReaction}
                    onRemoveReaction={handleRemoveCommentReaction}
                  />
                ))}
              </div>
            ) : (
              <div className='my-auto flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/50 bg-muted/20 px-6 py-8 text-center transition-all hover:bg-muted/30'>
                <div className='rounded-full bg-primary/10 p-3 ring-8 ring-primary/5'>
                  <MessageCircle className='h-6 w-6 text-primary' />
                </div>
                <div className='space-y-1 mt-2'>
                  <p className='text-sm font-semibold text-foreground/90'>{text.commentsModal.empty}</p>
                  <p className='text-xs text-muted-foreground'>{text.commentsModal.beFirstToComment}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className='shrink-0 border-t border-border/30 bg-background/80 p-4 backdrop-blur-xl'>
          <CommentInput
            placeholder={text.commentsModal.inputPlaceholder}
            isSubmitting={createCommentMutation.isPending}
            replyTarget={replyTarget ? { id: replyTarget.id, authorName: replyTarget.authorName } : null}
            onCancelReply={() => setReplyTarget(null)}
            onSubmit={handleCreateComment}
          />
        </div>
      </div>
    </aside>
  )
}
