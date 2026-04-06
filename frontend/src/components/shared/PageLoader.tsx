import { motion } from 'framer-motion'

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-navy z-[100] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-6"
        >
          ✈
        </motion.div>
        <span className="font-display text-2xl font-bold text-gold">Starlings</span>
        <span className="text-white/40 text-sm tracking-widest uppercase mt-1">Hospitality</span>
        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gold"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
