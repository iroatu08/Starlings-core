import { useRef, useState, type DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../../api/admin.api'

export interface HeroImageDropzoneProps {
  /** Current hero image URL (from upload or existing destination). */
  value: string
  /** Called when a new image is uploaded or the URL is cleared. */
  onHeroUrlChange: (url: string) => void
  /** When set, uploaded file is associated with this destination in the gallery. */
  destinationId?: string
  disabled?: boolean
  /** Associates the visible label with the file input for accessibility. */
  inputId: string
}

/**
 * Drag-and-drop (and click) image upload for hero images. Uses the admin gallery
 * upload endpoint and sets `heroImageUrl` from the returned Cloudinary URL.
 */
export function HeroImageDropzone({
  value,
  onHeroUrlChange,
  destinationId,
  disabled = false,
  inputId,
}: HeroImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: async (payload: { file: File; destinationId?: string }) => {
      const formData = new FormData()
      formData.append('file', payload.file)
      if (payload.destinationId) {
        formData.append('destinationId', payload.destinationId)
      }
      formData.append('altText', 'Hero image')
      const response = await adminApi.uploadGallery(formData)
      return response.data.data.url
    },
    onSuccess: (url: string) => {
      onHeroUrlChange(url)
      setLocalError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: () => {
      setLocalError('Upload failed. Check your connection and image hosting configuration.')
    },
  })

  const processFile = (file: File | undefined) => {
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      setLocalError('Please choose an image file (JPEG, PNG, WebP, etc.).')
      return
    }
    setLocalError(null)
    uploadMutation.mutate({ file, destinationId })
  }

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    if (disabled) {
      return
    }
    processFile(event.dataTransfer.files[0])
  }

  const openPicker = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const isBusy = uploadMutation.isPending || disabled

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isBusy}
        onChange={(event) => processFile(event.target.files?.[0])}
      />
      {value ? (
        <div
          className={`relative overflow-hidden rounded-xl border-2 border-border bg-white transition-all duration-200 ${isBusy ? 'opacity-60' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="relative aspect-[21/9] min-h-[140px] max-h-[220px] w-full">
            <img
              src={value}
              alt="Hero preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-end gap-2">
              <span className="mr-auto rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-navy shadow-sm">
                {uploadMutation.isPending ? 'Uploading…' : 'Image ready'}
              </span>
              <button
                type="button"
                className="rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm transition hover:bg-white disabled:opacity-50"
                disabled={isBusy}
                onClick={openPicker}
              >
                Replace
              </button>
              <button
                type="button"
                className="rounded-md border border-red-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                disabled={isBusy}
                onClick={() => {
                  onHeroUrlChange('')
                  setLocalError(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`
            block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200
            ${isDragging ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-border bg-white/80'}
            ${isBusy ? 'pointer-events-none opacity-60' : 'hover:border-gold/60 hover:bg-off-white/80'}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-gold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">
                Drop hero image here
              </p>
              <p className="mt-1 text-xs text-slate">
                or click to browse — JPEG, PNG, or WebP
              </p>
            </div>
          </div>
        </label>
      )}
      {localError && (
        <p className="text-xs text-red-600" role="alert">
          {localError}
        </p>
      )}
    </div>
  )
}
