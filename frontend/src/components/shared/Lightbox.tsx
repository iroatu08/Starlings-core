import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  images: Array<{ url: string; altText?: string }>
  initialIndex: number
  onClose: () => void
}

const SWIPE_THRESHOLD = 50

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  const prev = useCallback(() => setCurrentIndex((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrentIndex((i) => (i + 1) % images.length), [images.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') onClose()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (dx > SWIPE_THRESHOLD) prev()
    else if (dx < -SWIPE_THRESHOLD) next()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <button type="button" onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2" aria-label="Close">
        <X size={28} />
      </button>

      <button type="button" onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 text-white/80 hover:text-white z-10 p-2 hidden sm:block" aria-label="Previous image">
        <ChevronLeft size={32} />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 text-white/80 hover:text-white z-10 p-2 hidden sm:block" aria-label="Next image">
        <ChevronRight size={32} />
      </button>

      <div
        className="max-w-5xl max-h-[85vh] mx-8 sm:mx-16 touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex].url}
            alt={images[currentIndex].altText || `Image ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
            draggable={false}
          />
        </AnimatePresence>
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {currentIndex + 1} / {images.length}
        <span className="hidden sm:inline"> · Swipe on mobile</span>
      </p>
    </motion.div>
  )
}
