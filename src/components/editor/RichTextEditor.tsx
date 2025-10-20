'use client'

import { useState, useCallback } from 'react'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Undo, Redo, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [fontSize, setFontSize] = useState('16')
  
  const insertFormatting = useCallback((before: string, after: string = '') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      )
    }, 0)
  }, [value, onChange])

  const handleBold = () => insertFormatting('**', '**')
  const handleItalic = () => insertFormatting('*', '*')
  const handleH1 = () => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newText = value.substring(0, lineStart) + '# ' + value.substring(lineStart)
    onChange(newText)
  }
  const handleH2 = () => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newText = value.substring(0, lineStart) + '## ' + value.substring(lineStart)
    onChange(newText)
  }
  const handleList = () => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newText = value.substring(0, lineStart) + '- ' + value.substring(lineStart)
    onChange(newText)
  }
  const handleNumberedList = () => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newText = value.substring(0, lineStart) + '1. ' + value.substring(lineStart)
    onChange(newText)
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBold}
            title="Bold (Ctrl+B)"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            title="Italic (Ctrl+I)"
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleH1}
            title="Heading 1"
            className="h-8 w-8 p-0"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleH2}
            title="Heading 2"
            className="h-8 w-8 p-0"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleList}
            title="Bullet List"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNumberedList}
            title="Numbered List"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <textarea
        id="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ fontSize: `${fontSize}px` }}
        className="w-full min-h-[600px] rounded-md border border-input bg-background px-4 py-3 leading-relaxed ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
      />

      {/* Format Guide */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
        <p className="font-semibold mb-2">Formatting Guide:</p>
        <p>• **Bold text** for emphasis</p>
        <p>• *Italic text* for thoughts or emphasis</p>
        <p>• # Heading 1 for chapter titles</p>
        <p>• ## Heading 2 for section breaks</p>
        <p>• - Bullet point for lists</p>
        <p>• 1. Numbered list for sequences</p>
        <p>• Leave empty lines between paragraphs</p>
        <p>• Use "quotes" for dialogue</p>
      </div>
    </div>
  )
}
