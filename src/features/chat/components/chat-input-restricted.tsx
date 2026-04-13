interface ChatInfoBannerProps {
  message: string
  /** If true, parses <highlight>...</highlight> tags in message as blue bold text */
  highlightTags?: boolean
}

export function ChatInputRestricted({ message, highlightTags }: ChatInfoBannerProps) {
  return (
    <div className='relative shrink-0 flex flex-col items-center pb-[env(safe-area-inset-bottom,0)] bg-background h-26 justify-between border-t border-border'>
      <div className='flex-1 w-full flex items-center justify-center'>
        <div className='flex items-center gap-2.5 px-4'>
          <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0'>
            <span className='text-[12px] text-white font-bold'>i</span>
          </div>
          {highlightTags ? (
            <span
              className='text-[14.5px] text-muted-foreground font-medium'
              dangerouslySetInnerHTML={{
                __html: message.replace(
                  /<highlight>(.*?)<\/highlight>/,
                  '<span class="text-blue-500 font-semibold">$1</span>'
                )
              }}
            />
          ) : (
            <span className='text-[14.5px] text-muted-foreground font-medium'>{message}</span>
          )}
        </div>
      </div>
    </div>
  )
}
