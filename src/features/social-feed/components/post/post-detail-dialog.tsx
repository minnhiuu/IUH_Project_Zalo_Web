import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PostCard } from './post-card'
import { usePostById } from '../../queries/use-queries'
import { Loader2, AlertTriangle } from 'lucide-react'

interface PostDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
}

export function PostDetailDialog({ open, onOpenChange, postId }: PostDetailDialogProps) {
  const { data: post, isLoading, isError } = usePostById(postId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Post Detail</DialogTitle>
          <DialogDescription>View post details</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground'>
            <AlertTriangle className='h-8 w-8 text-orange-500' />
            <p className='text-sm font-medium'>This post is no longer available.</p>
            <p className='text-xs'>It may have been removed or hidden by a moderator.</p>
          </div>
        )}

        {post && (
          <div className='p-4'>
            <PostCard post={post} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
