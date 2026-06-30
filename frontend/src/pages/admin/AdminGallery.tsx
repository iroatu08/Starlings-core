import { useState, useRef, useEffect, useCallback } from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { galleryApi } from '../../api/gallery.api'
import { destinationsApi } from '../../api/destinations.api'
import { adminApi } from '../../api/admin.api'
import { toast } from '../../hooks/use-toast'

const PAGE = 30

/**
 * Returns the first image file from a `FileList`, or null if none have an image MIME type.
 *
 * @param fileList - Files from an `<input type="file">` or from `dataTransfer.files`
 * @returns The first matching file, or null
 */
function getFirstImageFile(fileList: FileList | null | undefined): File | null {
  if (!fileList?.length) return null
  for (let index = 0; index < fileList.length; index++) {
    const file = fileList.item(index)
    if (file && file.type.startsWith('image/')) return file
  }
  return null
}

export function AdminGallery() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [destinationId, setDestinationId] = useState('')
  const [altText, setAltText] = useState('')
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imagePendingDelete, setImagePendingDelete] = useState<{
    id: string
    previewLabel: string
  } | null>(null)

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations', 'admin-gallery'],
    queryFn: () => destinationsApi.getAll().then((r) => r.data.data),
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery-admin', 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      galleryApi.getPage({ page: pageParam, limit: PAGE }).then((r) => r.data.data),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  })

  const flat = data?.pages.flatMap((p) => p.data) ?? []

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      if (destinationId) fd.append('destinationId', destinationId)
      if (altText) fd.append('altText', altText)
      return adminApi.uploadGallery(fd, (event) => {
        if (!event.total) return
        setUploadProgress(Math.round((event.loaded * 100) / event.total))
      })
    },
    onMutate: () => {
      setUploadProgress(0)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] })
      queryClient.invalidateQueries({ queryKey: ['gallery-pages'] })
      setAltText('')
      if (fileRef.current) fileRef.current.value = ''
      toast({
        title: 'Image uploaded',
        description: 'Your image has been added to the gallery.',
        variant: 'success',
      })
    },
    onSettled: () => {
      setUploadProgress(0)
    },
  })

  // Once the browser→server transfer hits 100%, Cloudinary processing continues
  // server-side with no further progress events — show an indeterminate state.
  const isProcessingOnServer = uploadMutation.isPending && uploadProgress >= 100

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteGalleryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] })
      queryClient.invalidateQueries({ queryKey: ['gallery-pages'] })
      setImagePendingDelete(null)
      toast({
        title: 'Image removed',
        description: 'The gallery image has been deleted.',
        variant: 'success',
      })
    },
  })

  useEffect(() => {
    if (!imagePendingDelete) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImagePendingDelete(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [imagePendingDelete])

  const queueImageUpload = useCallback(
    (fileList: FileList | null | undefined) => {
      const file = getFirstImageFile(fileList)
      if (!file) {
        toast({
          title: 'No image found',
          description: 'Drop or choose a file with an image type (for example JPEG or PNG).',
          variant: 'destructive',
        })
        return
      }
      uploadMutation.mutate(file)
    },
    [uploadMutation],
  )

  const onFileInputChange = () => {
    queueImageUpload(fileRef.current?.files ?? null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const onDropZoneDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverDropZone(true)
  }

  const onDropZoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const next = e.relatedTarget as Node | null
    if (!next || !e.currentTarget.contains(next)) {
      setIsDragOverDropZone(false)
    }
  }

  const onDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOverDropZone(false)
    if (uploadMutation.isPending) return
    queueImageUpload(e.dataTransfer.files)
  }

  const openFilePicker = () => {
    if (uploadMutation.isPending) return
    fileRef.current?.click()
  }

  const uploadDisabled = uploadMutation.isPending

  return (
    <>
      <SeoHelmet title="Admin — Gallery" description="Manage Starlings Hospitality gallery images." />
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-border/80 pb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">Gallery</h1>
            <p className="text-sm text-slate mt-1 max-w-xl">
              Upload images and attach them to a destination or keep them as general gallery assets.
            </p>
          </div>
          {!isLoading && (
            <p className="text-sm font-medium text-navy tabular-nums shrink-0">
              {flat.length} {flat.length === 1 ? 'image' : 'images'}
              {hasNextPage ? ' shown' : ''}
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <section className="lg:col-span-5 xl:col-span-4 space-y-4" aria-labelledby="gallery-upload-heading">
            <h2 id="gallery-upload-heading" className="sr-only">
              Upload images
            </h2>

            <div className="rounded-xl border border-border bg-white p-4 space-y-3 text-sm shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate">
                Attachment details
              </p>
              <div>
                <label htmlFor="gallery-destination" className="block text-xs font-medium text-navy mb-1.5">
                  Destination (optional)
                </label>
                <select
                  id="gallery-destination"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  disabled={uploadDisabled}
                  className="input-field w-full"
                >
                  <option value="">None — general gallery</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="gallery-alt" className="block text-xs font-medium text-navy mb-1.5">
                  Alt text (optional)
                </label>
                <input
                  id="gallery-alt"
                  className="input-field w-full"
                  placeholder="Describe the image for accessibility"
                  value={altText}
                  disabled={uploadDisabled}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
            </div>
            <div
              role="region"
              aria-label="Drop zone for gallery image upload"
              onDragEnter={onDropZoneDragEnter}
              onDragLeave={onDropZoneDragLeave}
              onDragOver={onDropZoneDragOver}
              onDrop={onDropZoneDrop}
              className={[
                'relative rounded-2xl border-2 border-dashed transition-all duration-200',
                'bg-gradient-to-b from-off-white to-white',
                isDragOverDropZone
                  ? 'border-gold bg-gold/5 shadow-md ring-2 ring-gold/25'
                  : 'border-border hover:border-gold/50 hover:shadow-sm',
              ].join(' ')}
            >
              <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-3">
                <div
                  className={[
                    'flex h-14 w-14 items-center justify-center rounded-2xl',
                    isDragOverDropZone ? 'bg-gold/20 text-gold' : 'bg-navy/5 text-navy',
                  ].join(' ')}
                >
                  <Upload className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <p className="font-display font-semibold text-navy">
                    Drag and drop an image
                  </p>
                  <p className="text-sm text-slate mt-1">
                    or{' '}
                    <button
                      type="button"
                      onClick={openFilePicker}
                      disabled={uploadDisabled}
                      className="text-gold font-semibold underline underline-offset-2 hover:text-gold-600 disabled:no-underline disabled:opacity-60"
                    >
                      browse files
                    </button>
                  </p>
                  <input
                    ref={fileRef}
                    id="gallery-admin-file-input"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onFileInputChange}
                  />
                </div>
                <p className="text-xs text-slate/90 max-w-xs">
                  Optional: set destination and alt text below before uploading — they apply to the next upload.
                </p>
              </div>
              {uploadMutation.isPending && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[14px] bg-white/85 px-6 backdrop-blur-[2px]">
                  <span className="text-sm font-semibold text-navy">
                    {isProcessingOnServer ? 'Processing…' : `Uploading… ${uploadProgress}%`}
                  </span>
                  <div
                    className="h-2 w-full max-w-[16rem] overflow-hidden rounded-full bg-navy/10"
                    role="progressbar"
                    aria-label="Upload progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={isProcessingOnServer ? undefined : uploadProgress}
                  >
                    <div
                      className={[
                        'h-full rounded-full bg-gold transition-all duration-200 ease-out',
                        isProcessingOnServer ? 'w-full animate-pulse' : '',
                      ].join(' ')}
                      style={isProcessingOnServer ? undefined : { width: `${uploadProgress}%` }}
                    />
                  </div>
                  {isProcessingOnServer && (
                    <span className="text-xs text-slate">Finalizing on the server…</span>
                  )}
                </div>
              )}
            </div>


            {uploadMutation.isError && (
              <p className="text-red-600 text-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                Upload failed. Check Cloudinary configuration and try again.
              </p>
            )}
          </section>

          <section className="lg:col-span-7 xl:col-span-8 space-y-4" aria-label="Gallery images">
            <h2 className="font-display text-lg font-bold text-navy">Library</h2>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square shimmer-bg rounded-xl" />
                ))}
              </div>
            ) : flat.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-off-white py-16 px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy mb-4">
                  <ImagePlus className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="font-semibold text-navy">No images yet</p>
                <p className="text-sm text-slate mt-2 max-w-sm">
                  Upload photos using the panel on the left. They appear here instantly after upload.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {flat.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl overflow-hidden border border-border bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-gold/30"
                    >
                      <img
                        src={img.url}
                        alt={img.altText || 'Gallery'}
                        className="w-full aspect-square object-cover"
                      />
                      {img.destination?.name && (
                        <span className="absolute left-2 top-10 sm:top-2 max-w-[calc(100%-3.25rem)] sm:max-w-[calc(100%-1rem)] truncate rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy shadow-sm backdrop-blur-sm">
                          {img.destination.name}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={img.altText ? `Delete image: ${img.altText}` : 'Delete gallery image'}
                        onClick={() =>
                          setImagePendingDelete({
                            id: img.id,
                            previewLabel: img.altText?.trim() || 'Untitled image',
                          })
                        }
                        className="absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-navy/75 text-white shadow-md backdrop-blur-sm ring-1 ring-white/25 transition-colors hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/92 via-navy/40 to-transparent p-3 pt-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-sm:opacity-100">
                        <p className="text-[11px] text-white/95 line-clamp-2 text-left">
                          {img.altText?.trim() || 'No alt text'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {hasNextPage && (
                  <button
                    type="button"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    className="btn-outline text-sm mt-2"
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        {imagePendingDelete && (
          <div
            className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm"
            role="presentation"
            onClick={() => {
              if (!deleteMutation.isPending) setImagePendingDelete(null)
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="gallery-delete-title"
              className="bg-white border border-border rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="gallery-delete-title" className="font-display text-lg font-bold text-navy">
                Delete this image?
              </h2>
              <p className="text-sm text-[#4B5563]">
                This will permanently remove the image from the gallery
                {imagePendingDelete.previewLabel
                  ? ` (“${imagePendingDelete.previewLabel}”)`
                  : ''}
                . This action cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => setImagePendingDelete(null)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(imagePendingDelete.id)}
                  className="text-sm px-6 py-3 rounded-lg font-semibold text-white bg-red-700 hover:bg-red-800 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete image'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
