import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Clock, Mail, MessageCircle, Phone } from 'lucide-react';
import { SeoHelmet } from '../components/shared/SeoHelmet';
import { contactApi } from '../api/contact.api';

type InquiryType =
  | 'general'
  | 'booking'
  | 'pricing'
  | 'custom_itinerary'
  | 'support';

type ContactFormValues = {
  name: string;
  email: string;
  inquiryType: InquiryType;
  subject: string;
  budget: string;
  message: string;
};

const INQUIRY_OPTIONS: Array<{ value: InquiryType; label: string }> = [
  { value: 'general', label: 'General question' },
  { value: 'booking', label: 'Help with booking' },
  { value: 'pricing', label: 'Pricing & packages' },
  { value: 'custom_itinerary', label: 'Custom itinerary request' },
  { value: 'support', label: 'Existing booking support' },
];

const FAQ_ITEMS = [
  {
    question: 'Do I need to know exactly where I want to travel before contacting Starlings?',
    answer:
      'Contact us as soon as possible. Our team will review your booking status and outline available options, including refunds where applicable.',
  },
  {
    question: 'Can Starlings handle my visa and travel bookings together, or are they separate services?',
    answer:
      'Yes. Every experience bundle lets you keep or remove optional add-ons before checkout. For fully bespoke itineraries, select "Custom itinerary request" below.',
  },
  {
    question: 'How far in advance should I book, and how long does planning typically take?',
    answer:
      'We recommend booking at least 4–6 weeks ahead for visa processing and hotel availability. Last-minute requests are welcome — our team will advise what is still possible.',
  },
  {
    question: 'Does Starlings only handle international travel?',
    answer:
      'All payments are processed through Paystack with industry-standard encryption. You receive a confirmation and receipt immediately after payment.',
  },
  {
    question: 'Can I get a fully customized experience, or do I have to choose from set packages?',
    answer:
      'Yes. Every experience bundle lets you keep or remove optional add-ons before checkout. For fully bespoke itineraries, select "Custom itinerary request" below.',
  },
] as const;

function getSubmitErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string | string[] } } }).response;
    const msg = res?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return 'Something went wrong. Please try again.';
}

function buildMessageWithInquiryType(data: ContactFormValues): string {
  const label = INQUIRY_OPTIONS.find((o) => o.value === data.inquiryType)?.label ?? data.inquiryType;
  return `[Inquiry: ${label}]\n\n${data.message.trim()}`;
}

/**
 * Contact page with objection-handling FAQ and structured inquiry types.
 */
export function Contact() {
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: '',
      email: '',
      inquiryType: 'general',
      subject: '',
      budget: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues): Promise<void> => {
    setSubmitError('');
    setSuccess(false);
    try {
      const inquiryLabel = INQUIRY_OPTIONS.find((o) => o.value === data.inquiryType)?.label;
      await contactApi.submit({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim() || inquiryLabel || 'Contact inquiry',
        message: buildMessageWithInquiryType(data),
        budget: data.budget.trim() || undefined,
      });
      setSuccess(true);
      reset();
    } catch (e) {
      setSuccess(false);
      setSubmitError(getSubmitErrorMessage(e));
    }
  };

  return (
    <>
      <SeoHelmet
        title="Contact"
        description="Get answers about Starlings experiences, pricing, custom itineraries, and booking support."
      />

      <section className="gradient-navy relative flex h-64 items-end overflow-hidden md:h-80">
        <div className="container-custom relative w-full pb-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">WE ARE HERE</p>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Contact</h1>
            <p className="mt-3 max-w-xl text-white/80">
              Questions before you book? Our team typically responds within one business day.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container-custom max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-navy">WE ARE HERE</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
              Let&apos;s Plan Your Next Experience
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              Whether you&apos;re planning a vacation, applying for a visa, booking flights, or simply exploring
              your options, our team is here to help you make the right decisions.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-5">
          <aside className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
                <Clock className="mt-0.5 shrink-0 text-gold" size={20} />
                <div>
                  <p className="font-semibold text-navy">Response time</p>
                  <p className="text-sm text-slate">Within one business day, often sooner.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
                <Mail className="mt-0.5 shrink-0 text-gold" size={20} />
                <div>
                  <p className="font-semibold text-navy">Email</p>
                  <a href="mailto:hello@starlings.com" className="text-sm text-slate hover:text-navy">
                    hello@starlings.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
                <Phone className="mt-0.5 shrink-0 text-gold" size={20} />
                <div>
                  <p className="font-semibold text-navy">Phone</p>
                  <p className="text-sm text-slate">Available after your inquiry to ensure you're connected with the right specialist.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
                <MessageCircle className="mt-0.5 shrink-0 text-gold" size={20} />
                <div>
                  <p className="font-semibold text-navy">Before you write</p>
                  <p className="text-sm text-slate">
                    Tell us your destination, travel dates, and what you need help with — we'll address it
                    directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="mb-4 font-display text-xl text-navy">Commonly Asked Questions</h3>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, index) => (
                  <div key={item.question} className="rounded-xl border border-border bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-navy"
                      aria-expanded={openFaq === index}
                    >
                      {item.question}
                      <span className="text-gold">{openFaq === index ? '−' : '+'}</span>
                    </button>
                    {openFaq === index && (
                      <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-slate">
                        {item.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {success && (
              <p
                className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                role="status"
              >
                Thank you — we have received your message and will reply shortly.
              </p>
            )}
            {submitError && (
              <p
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {submitError}
              </p>
            )}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm"
            >
              <div>
                <label htmlFor="contact-inquiry-type" className="mb-1 block text-sm font-medium text-navy">
                  What can we help with?
                </label>
                <select
                  id="contact-inquiry-type"
                  className="input-field w-full"
                  {...register('inquiryType')}
                >
                  {INQUIRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-navy">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    className="input-field w-full"
                    {...register('name', { required: true })}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-navy">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="input-field w-full"
                    {...register('email', { required: true })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-navy">
                  Subject <span className="font-normal text-slate">(optional)</span>
                </label>
                <input id="contact-subject" className="input-field w-full" {...register('subject')} />
              </div>
              <div>
                <label htmlFor="contact-budget" className="mb-1 block text-sm font-medium text-navy">
                  Budget <span className="font-normal text-slate">(optional)</span>
                </label>
                <input
                  id="contact-budget"
                  className="input-field w-full"
                  placeholder="e.g. ₦500k–1M or $2,000"
                  {...register('budget')}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-navy">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  className="input-field w-full resize-y"
                  placeholder="Tell us your destination, dates, and any concerns — we'll address them directly."
                  {...register('message', { required: true })}
                />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
