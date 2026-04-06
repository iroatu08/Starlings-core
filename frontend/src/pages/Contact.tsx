import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

type ContactFormValues = {
  name: string
  email: string
  message: string
}

export function Contact() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactFormValues>({
    defaultValues: { name: '', email: '', message: '' },
  })

  const onSubmit = async (_data: ContactFormValues) => {
    await new Promise((r) => setTimeout(r, 400))
    reset()
  }

  return (
    <>
      <SeoHelmet
        title="Contact"
        description="Contact Starlings Hospitality for travel questions, quotes, and support."
      />

      <section className="relative h-64 md:h-80 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">We are here</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Contact</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-border rounded-2xl p-8 shadow-sm">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-navy mb-1">Name</label>
              <input id="contact-name" className="input-field w-full" {...register('name', { required: true })} />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-navy mb-1">Email</label>
              <input id="contact-email" type="email" className="input-field w-full" {...register('email', { required: true })} />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-navy mb-1">Message</label>
              <textarea id="contact-message" rows={5} className="input-field w-full resize-y" {...register('message', { required: true })} />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
