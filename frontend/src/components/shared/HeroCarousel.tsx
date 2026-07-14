import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&h=1080&fit=crop&q=80',
    alt: 'Friends enjoying a cultural experience abroad',
    width: 1920,
    height: 1080,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop&q=80',
    alt: 'Travelers exploring a vibrant coastal city',
    width: 1920,
    height: 1080,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&h=1080&fit=crop&q=80',
    alt: 'Guests walking through a historic UK neighbourhood',
    width: 1920,
    height: 1080,
  },
] as const;

const LCP_IMAGE = HERO_SLIDES[0].image;

/**
 * Full-viewport hero carousel with conversion-focused CTAs.
 */
export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number, dir: number): void => {
    setDirection(dir);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = LCP_IMAGE;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[currentIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

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
          <div className="relative h-full w-full aspect-[16/9] min-h-full">
            <img
              src={slide.image}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
              decoding={currentIndex === 0 ? 'sync' : 'async'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
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
          Curated experiences across Nigeria, Ghana, and the UK — show up, enjoy, and let your concierge
          handle every detail.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/get-started"
            className="rounded-lg bg-[#fdce5d] px-8 py-4 font-sans font-bold tracking-wider text-[#745700] transition-all hover:bg-white"
          >
            START YOUR EXPERIENCE
          </Link>
          <Link
            to="/destinations"
            className="rounded-lg border border-white/30 bg-white/5 px-8 py-4 font-sans font-bold tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/10"
          >
            BROWSE EXPERIENCES
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
  );
}
