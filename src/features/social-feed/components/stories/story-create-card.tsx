import { Plus } from 'lucide-react'

interface StoryCreateCardProps {
  backgroundImageUrl?: string
  title: string
  alt: string
  onClick?: () => void
}

export function StoryCreateCard({ backgroundImageUrl, title, alt, onClick }: StoryCreateCardProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='group relative flex flex-col h-[250px] w-[140px] shrink-0 overflow-hidden rounded-[12px] bg-white text-left shadow-sm ring-1 ring-zinc-200/50 transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-[#242526] dark:ring-white/10'
    >
      <div className='relative h-[160px] w-full overflow-hidden'>
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt={alt}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='h-full w-full bg-gradient-to-br from-primary/30 via-sky-500/20 to-emerald-500/20 dark:from-primary/40 dark:via-sky-500/30 dark:to-emerald-500/30' />
        )}
        <div className='absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10' />
      </div>

      <div className='relative flex h-[90px] w-full flex-col items-center pt-6'>
        <div className='absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-500 transition-transform duration-300 group-hover:scale-110 dark:border-[#242526]'>
          <Plus className='h-6 w-6 text-white' />
        </div>
        <p className='text-[13px] font-semibold text-zinc-900 dark:text-[#ececec]'>{title}</p>
      </div>
    </button>
  )
}
