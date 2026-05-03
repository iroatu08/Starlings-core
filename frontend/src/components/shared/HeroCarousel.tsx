import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const HERO_SLIDES = [
  {
    id: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDm30t-xuFW4S9hUYwnD8yIh0mBwR5ssRlpkYsIDD4HScaLm9zN3clCPR6yycQAi8M4n6Y_660QvkAHdFGRIca-1sUW-XoKbIQXAfzZBfOt0b-oI8t6GAC4S8Ig21lWVWCegd1ebK1TAef3IZLBQqLdYD9vWqyYwVkwlsa01HS2KgkwExslXCXC9_wwO68yNpDsZ0hsdqqh70Xsp26Dd9X0Zo72l0IlVqWAYhqUKU96Ue9ezKKv2xGRhmTz4UXNiEM5946ENrNIrejj',
    alt: 'Dubai skyline at twilight',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
    alt: 'Luxury travel destination',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
    alt: 'Paris skyline',
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (index: number, dir: number) => {
    setDirection(dir)
    setCurrentIndex(index)
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      setDirection(1)
      setCurrentIndex((i) => (i + 1) % HERO_SLIDES.length)
    }, 7000)
    return () => window.clearInterval(id)
  }, [])

  const slide = HERO_SLIDES[currentIndex]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#041534]/40 via-[#041534]/50 to-[#041534]/85"
            aria-hidden
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-5xl font-display text-5xl leading-tight tracking-tight text-white md:text-7xl md:leading-tight md:-tracking-widest">
          Where your travel dreams{' '}
          <br className="hidden sm:block" />
          <span className="italic text-[#fdce5d]">become reality</span>
        </h1>
        <p className="mt-8 max-w-2xl text-xl font-light tracking-wide text-white/80 md:text-2xl">
          Experience the pinnacle of luxury hospitality in Dubai and beyond, curated by Starlings.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/destinations"
            className="rounded-lg bg-[#fdce5d] px-8 py-4 font-sans font-bold tracking-wider text-[#745700] transition-all hover:bg-white"
          >
            DISCOVER MORE
          </Link>
          <Link
            to="/gallery"
            className="rounded-lg border border-white/30 bg-white/5 px-8 py-4 font-sans font-bold tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/10"
          >
            VIEW GALLERY
          </Link>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 gap-4">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i, i > currentIndex ? 1 : -1)}
            className={`h-1 transition-all ${i === currentIndex ? 'w-16 bg-white' : 'w-16 bg-white/30'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
