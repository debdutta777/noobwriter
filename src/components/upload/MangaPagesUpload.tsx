'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Upload, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface MangaPageItem {
  id?: string
  page_number: number
  image_url: string
}

interface MangaPagesUploadProps {
  initialPages?: MangaPageItem[]
  chapterId: string
  onChange?: (pages: MangaPageItem[]) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per page
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function MangaPagesUpload({ initialPages = [], chapterId, onChange }: MangaPagesUploadProps) {
  const [pages, setPages] = useState<MangaPageItem[]>(
    [...initialPages].sort((a, b) => a.page_number - b.page_number),
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const emit = (next: MangaPageItem[]) => {
    const renumbered = next.map((p, i) => ({ ...p, page_number: i + 1 }))
    setPages(renumbered)
    onChange?.(renumbered)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to upload pages')

      const uploaded: MangaPageItem[] = []

      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`Skipped ${file.name}: unsupported type`)
          continue
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`Skipped ${file.name}: larger than 10MB`)
          continue
        }

        const ext = file.name.split('.').pop()
        const path = `${user.id}/${chapterId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const { data, error: upErr } = await supabase.storage
          .from('manga-pages')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (upErr) throw upErr

        const { data: { publicUrl } } = supabase.storage
          .from('manga-pages')
          .getPublicUrl(data.path)

        uploaded.push({ page_number: 0, image_url: publicUrl })
      }

      emit([...pages, ...uploaded])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload'
      setError(msg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = [...pages]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    emit(next)
  }

  const remove = (index: number) => {
    const next = pages.filter((_, i) => i !== index)
    emit(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Pages ({pages.length})</p>
          <p className="text-xs text-muted-foreground">
            Upload JPG/PNG/WebP images in reading order. You can reorder after upload.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Add Pages
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-600 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {pages.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
          No pages yet. Click &quot;Add Pages&quot; to upload images.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((p, idx) => (
            <div key={`${p.image_url}-${idx}`} className="relative group border rounded-lg overflow-hidden bg-muted">
              <div className="relative aspect-[2/3]">
                <Image
                  src={p.image_url}
                  alt={`Page ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-2 flex items-center justify-between text-xs">
                <span className="font-medium">Page {idx + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === pages.length - 1}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10"
                    aria-label="Remove page"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
