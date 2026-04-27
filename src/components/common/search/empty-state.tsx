interface EmptyStateProps {
  image: string
  text: string
}

export function EmptyState({ image, text }: EmptyStateProps) {
  return (
    <div className='flex-1 flex flex-col items-center justify-center p-8'>
      <div className='relative mb-6'>
        <div className='absolute inset-0 bg-primary/5 rounded-full blur-3xl' />
        <img src={image} alt='Empty state' className='w-48 h-48 object-contain relative z-10 opacity-90 dark:opacity-80' />
      </div>
      <p className='text-[14px] text-muted-foreground text-center max-w-[280px] leading-relaxed select-none'>{text}</p>
    </div>
  )
}
