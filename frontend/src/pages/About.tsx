import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

const TEAM = [
  { name: 'Amara Okonkwo', role: 'Founder & CEO', bio: 'Leads strategy and partner relationships across Europe, the Gulf, and West Africa.' },
  { name: 'James Mitchell', role: 'Head of Visa & Compliance', bio: 'Ensures documentation and timelines stay clear for every traveller.' },
  { name: 'Sofia Laurent', role: 'Experience Design', bio: 'Curates itineraries, hotels, and activities to match how you travel.' },
]

const TIMELINE = [
  { year: '2016', title: 'Starlings launches', text: 'Focused on France and the UK with visa-first packages for Nigerian travellers.' },
  { year: '2019', title: 'Gulf & North America', text: 'Expanded to UAE, USA, and Canada with coordinated flight and hotel bundles.' },
  { year: '2023', title: 'Full-service hospitality', text: 'Added activities, corporate groups, and a unified booking and payment flow.' },
]

const PARTNERS = ['Airline partners', 'Hotel groups', 'Activity operators', 'Insurance & assistance']

export function About() {
  return (
    <>
      <SeoHelmet
        title="About"
        description="Why Starlings exists — our vision and mission for confident, effortless travel experiences."
      />

      <section className="relative h-64 md:h-80 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Why We Exist</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">About us</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom max-w-3xl mb-16">
          

          <p className="text-slate text-lg leading-relaxed mb-6">
            Experiences shape the way we see the world, yet planning them often feels unnecessarily complicated.
          </p>
          <p className="text-slate text-lg leading-relaxed mb-6">
            At Starlings, we believe every journey, celebration, getaway, and milestone should begin with
            confidence — not confusion, chaos, and definitely not stress.
          </p>
          <p className="text-lg leading-relaxed mb-6 font-semibold text-navy">
            That&apos;s why we exist.
          </p>
          <p className="text-slate text-lg leading-relaxed mb-6">
            We bring together thoughtful planning, trusted expertise, and genuine care to create
            experiences people can actually enjoy. Whether it&apos;s securing a visa, booking a flight, planning
            a vacation, curating activities, or unlocking new destinations, we remove the friction so our
            clients can focus on what truly matters — the experience itself.
          </p>
          <p className="text-slate text-lg leading-relaxed mb-10">
            Today, we help people move with confidence within and across borders. Tomorrow, we&apos;re
            building spaces, services, and experiences that inspire people to explore the world in entirely
            new ways.
          </p>

          <h2 className="font-display text-2xl font-bold text-navy mb-4">Vision</h2>
          <p className="text-slate leading-relaxed mb-8">
            To redefine how people experience the world — making every journey, destination, and
            moment feel effortless, memorable, and deeply personal.
          </p>

          <h2 className="font-display text-2xl font-bold text-navy mb-4">Mission</h2>
          <p className="text-slate leading-relaxed">
            We&apos;re committed to creating exceptional experiences through hospitality, innovation, and
            thoughtful service — helping people move, explore, connect, and celebrate with confidence.
          </p>
        </div>

        <div className="container-custom mb-20">
          <h2 className="font-display text-2xl font-bold text-navy mb-8 text-center">Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((m) => (
              <motion.article
                key={m.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-navy/10 text-navy flex items-center justify-center font-display font-bold text-lg mb-4">
                  {m.name.split(' ').map((p) => p[0]).join('')}
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{m.name}</h3>
                <p className="text-gold text-sm font-semibold mb-2">{m.role}</p>
                <p className="text-slate text-sm leading-relaxed">{m.bio}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="container-custom mb-20">
          <h2 className="font-display text-2xl font-bold text-navy mb-10 text-center">Timeline</h2>
          <div className="max-w-2xl mx-auto border-l-2 border-gold/40 pl-8 space-y-10">
            {TIMELINE.map((t) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <span className="absolute -left-[2.125rem] top-1 w-3 h-3 rounded-full bg-gold border-4 border-off-white" />
                <p className="text-gold font-bold text-sm mb-1">{t.year}</p>
                <h3 className="font-display text-lg font-bold text-navy mb-2">{t.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="container-custom">
          <h2 className="font-display text-2xl font-bold text-navy mb-6 text-center">Partners</h2>
          <p className="text-slate text-center max-w-xl mx-auto mb-10 text-sm">
            We work with airlines, hotel groups, ground operators, and assistance providers that share our standards.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {PARTNERS.map((p) => (
              <div
                key={p}
                className="px-6 py-4 rounded-xl border border-border bg-white text-slate text-sm font-medium shadow-sm"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
