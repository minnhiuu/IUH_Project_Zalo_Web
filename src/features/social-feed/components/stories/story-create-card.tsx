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
      className='group relative h-[240px] w-[140px] shrink-0 overflow-hidden rounded-[20px] bg-zinc-100 text-left shadow-sm ring-1 ring-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-900 dark:ring-white/10 dark:hover:ring-indigo-400/40'
    >
      {backgroundImageUrl ? (
        <img
          src={backgroundImageUrl}
          alt={alt}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
        />
      ) : (
        <div className='h-full w-full bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-emerald-500/20 dark:from-indigo-500/40 dark:via-sky-500/30 dark:to-emerald-500/30' />
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90' />
      <div className='absolute inset-x-0 bottom-0 flex flex-col items-center pb-4 pt-6'>
        <div className='absolute bottom-[44px] inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110 dark:border-zinc-900'>
          <Plus className='h-5 w-5' />
        </div>
        <p className='mt-6 text-[13px] font-semibold tracking-wide text-white drop-shadow-md'>{title}</p>
      </div>
    </button>
  )
}
