import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react'
import { cn } from '@/lib/utils'

interface RichInputProps {
  placeholder?: string
  value: string
  onChange: (html: string, rawText: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  className?: string
  mentions?: { name: string; id: string }[] // optional, for tracking active mentions
}

export interface RichInputRef {
  insertMention: (name: string, userId: string) => void
  focus: () => void
  clear: () => void
  innerHTML: string
}

export const RichInput = forwardRef<RichInputRef, RichInputProps>(
  ({ placeholder, value, onChange, onKeyDown, className }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      insertMention: (name: string, userId: string) => {
        if (!editorRef.current) return

        // Find the @ trigger text before caret and remove it
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const node = range.startContainer

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || ''
          const atIndex = text.lastIndexOf('@', range.startOffset)

          if (atIndex !== -1) {
            // Remove text from @ to cursor
            range.setStart(node, atIndex)
            range.deleteContents()
          }
        }

        // Insert the mention span
        const span = document.createElement('span')
        span.className = 'text-blue-500 select-none'
        span.contentEditable = 'false'
        span.dataset.mention = 'true'
        span.dataset.id = userId
        span.innerText = `@${name}`

        range.insertNode(span)

        // Insert a space after the mention
        const space = document.createTextNode(' ')
        range.setStartAfter(span)
        range.insertNode(space)
        range.setStartAfter(space)
        range.collapse(true)

        selection.removeAllRanges()
        selection.addRange(range)

        handleInput()
      },
      focus: () => {
        editorRef.current?.focus()
        // Move caret to end
        const selection = window.getSelection()
        const range = document.createRange()
        if (editorRef.current) {
          range.selectNodeContents(editorRef.current)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      },
      clear: () => {
        if (editorRef.current) {
          editorRef.current.innerHTML = ''
          handleInput()
        }
      },
      get innerHTML() {
        return editorRef.current?.innerHTML || ''
      }
    }))

    const handleInput = () => {
      if (!editorRef.current) return
      const html = editorRef.current.innerHTML
      const text = editorRef.current.innerText
      onChange(html, text)
    }

    // Set initial value only once or when value is extremely reset
    useEffect(() => {
      if (editorRef.current && value === '' && editorRef.current.innerHTML !== '') {
        editorRef.current.innerHTML = ''
      }
    }, [value])

    return (
      <div className='relative w-full min-h-[44px] max-h-[120px] overflow-y-auto custom-scrollbar flex items-center'>
        {!value && (
          <div className='absolute left-4 top-2.5 text-muted-foreground pointer-events-none select-none text-[16px]'>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full bg-transparent border-none focus-visible:outline-none min-h-[24px] py-2.5 px-4 text-[16px] break-words whitespace-pre-wrap',
            className
          )}
          style={{ overflowWrap: 'anywhere' }}
        />
      </div>
    )
  }
)
RichInput.displayName = 'RichInput'
