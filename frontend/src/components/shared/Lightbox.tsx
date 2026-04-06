import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  images: Array<{ url: string; altText?: string }>
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrentIndex((i) => (i + 1) % images.length)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') onClose()
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
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2">
        <X size={28} />
      </button>

      <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 text-white/80 hover:text-white z-10 p-2">
        <ChevronLeft size={32} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 text-white/80 hover:text-white z-10 p-2">
        <ChevronRight size={32} />
      </button>

      <div className="max-w-5xl max-h-[85vh] mx-16" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex].url}
            alt={images[currentIndex].altText || `Image ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  )
}
