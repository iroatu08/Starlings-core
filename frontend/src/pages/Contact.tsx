import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { contactApi } from '../api/contact.api'

type ContactFormValues = {
  name: string
  email: string
  subject: string
  budget: string
  message: string
}

function getSubmitErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string | string[] } } }).response
    const msg = res?.data?.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg)) return msg.join(', ')
  }
  return 'Something went wrong. Please try again.'
}

export function Contact() {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactFormValues>({
    defaultValues: { name: '', email: '', subject: '', budget: '', message: '' },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitError('')
    setSuccess(false)
    try {
      await contactApi.submit({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim() || undefined,
        message: data.message.trim(),
        budget: data.budget.trim() || undefined,
      })
      setSuccess(true)
      reset()
    } catch (e) {
      setSuccess(false)
      setSubmitError(getSubmitErrorMessage(e))
    }
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
          {success && (
            <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
              Thank you — we have received your message and will reply shortly.
            </p>
          )}
          {submitError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {submitError}
            </p>
          )}
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
              <label htmlFor="contact-subject" className="block text-sm font-medium text-navy mb-1">
                Subject <span className="text-slate font-normal">(optional)</span>
              </label>
              <input id="contact-subject" className="input-field w-full" {...register('subject')} />
            </div>
            <div>
              <label htmlFor="contact-budget" className="block text-sm font-medium text-navy mb-1">
                Budget <span className="text-slate font-normal">(optional)</span>
              </label>
              <input id="contact-budget" className="input-field w-full" placeholder="e.g. ₦500k–1M or $2,000" {...register('budget')} />
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
