'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface CoverUploadProps {
  currentCoverUrl?: string
  onUploadComplete: (url: string) => void
  aspectRatio?: 'portrait' | 'square' // portrait = 2:3, square = 1:1
}

export default function CoverUpload({ 
  currentCoverUrl, 
  onUploadComplete,
  aspectRatio = 'portrait' 
}: CoverUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentCoverUrl || null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const validateImage = async (file: File): Promise<boolean> => {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return false
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed')
      return false
    }

    // Check aspect ratio
    return new Promise((resolve) => {
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const ratio = img.width / img.height
        
        if (aspectRatio === 'portrait') {
          // Portrait should be roughly 2:3 (0.6 to 0.7)
          if (ratio < 0.5 || ratio > 0.8) {
            setError('Cover should be portrait orientation (recommended 2:3 ratio, e.g., 800x1200px)')
            URL.revokeObjectURL(img.src)
            resolve(false)
            return
          }
        } else {
          // Square should be roughly 1:1 (0.9 to 1.1)
          if (ratio < 0.9 || ratio > 1.1) {
            setError('Cover should be square (1:1 ratio, e.g., 800x800px)')
            URL.revokeObjectURL(img.src)
            resolve(false)
            return
          }
        }
        
        URL.revokeObjectURL(img.src)
        resolve(true)
      }
      img.onerror = () => {
        setError('Failed to load image')
        URL.revokeObjectURL(img.src)
        resolve(false)
      }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    
    // Validate image
    const isValid = await validateImage(file)
    if (!isValid) return

    setUploading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to upload images')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(data.path)

      setPreview(publicUrl)
      onUploadComplete(publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onUploadComplete('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Preview or Upload Area */}
        <div className={`relative ${aspectRatio === 'portrait' ? 'w-48 h-72' : 'w-48 h-48'} border-2 border-dashed border-gray-600 rounded-lg overflow-hidden bg-gray-800`}>
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Cover preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                aria-label="Remove cover image"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-700 transition-colors">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400 text-center px-4">
                    Click to upload<br />cover image
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Instructions */}
        <div className="flex-1 text-sm text-gray-400 space-y-2">
          <p className="font-semibold text-gray-300">Cover Image Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Format: JPG, PNG, or WebP</li>
            <li>Max size: 5MB</li>
            {aspectRatio === 'portrait' ? (
              <li>Ratio: Portrait (2:3 recommended)</li>
            ) : (
              <li>Ratio: Square (1:1)</li>
            )}
            <li>Recommended: {aspectRatio === 'portrait' ? '800x1200px' : '800x800px'} or higher</li>
          </ul>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
