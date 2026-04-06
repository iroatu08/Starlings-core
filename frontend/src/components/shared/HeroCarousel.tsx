import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
    destination: 'Paris, France',
    tagline: 'The City of Light Awaits',
    cta: '/destinations?country=France',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
    destination: 'Dubai, UAE',
    tagline: 'Where Luxury Meets the Desert',
    cta: '/destinations?country=UAE',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80',
    destination: 'London, United Kingdom',
    tagline: 'Royal Heritage, Modern Energy',
    cta: '/destinations?country=UK',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=1920&q=80',
    destination: 'New York, USA',
    tagline: 'The City That Never Sleeps',
    cta: '/destinations?country=USA',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&q=80',
    destination: 'Toronto, Canada',
    tagline: 'Where Adventure Meets Elegance',
    cta: '/destinations?country=Canada',
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = (index: number, dir: number) => {
    setDirection(dir)
    setCurrentIndex(index)
  }

  const next = () => goTo((currentIndex + 1) % HERO_SLIDES.length, 1)
  const prev = () => goTo((currentIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length, -1)

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [currentIndex])

  const slide = HERO_SLIDES[currentIndex]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden bg-navy">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          {/* Parallax image */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: 'linear' }}
          >
            <img
              src={slide.image}
              alt={slide.destination}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 bg-navy/30" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-4"
            >
              {slide.destination}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight"
            >
              {slide.tagline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="mt-4 text-white/70 text-lg max-w-xl"
            >
              Where your travel dreams become reality
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link to={slide.cta} className="btn-primary text-base px-8 py-4">
                Explore Packages
              </Link>
              <Link to="/get-started" className="btn-outline border-white text-white hover:bg-white hover:text-navy text-base px-8 py-4">
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-gold transition-all duration-200 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-gold transition-all duration-200 z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > currentIndex ? 1 : -1)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex ? 'w-8 h-2 bg-gold' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-white/50 text-xs"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-px h-8 bg-white/30" />
        <span className="writing-mode-vertical text-[10px] tracking-widest uppercase rotate-90 mt-1">Scroll</span>
      </motion.div>
    </div>
  )
}
