import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Verified, Shield, Sparkles } from 'lucide-react'
import { newsletterApi } from '../api/newsletter.api'
import { HeroCarousel } from '../components/shared/HeroCarousel'
import { LuxuryDestinationCard } from '../components/home/LuxuryDestinationCard'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { destinationsApi } from '../api/destinations.api'
import type { Destination } from '../types/destination.types'
import { toast } from '../hooks/use-toast'

const EXPERIENCES = [
  {
    title: 'Skydiving',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQtm4xea5rZ5J9U4vylUXDv0sfYRBhb02pDR9Sr47cAeSiON7LCBK2JDXQ4x4Lo7HOSIhU-1T4g4ftuXKf4tNq12G4lseFAHGq8jRIPvUTY4WqoUBs2UMlXEG76gEcrrXu26LHRPlH70Jq1Q04yC0osN74e2YzmhhnG4JHvRBoXFMARyVpPjgpJCVDLulVneRj7LnRer_gGVQLqJ7_wHo3lJrmqsY7HWFfKyRLmu6Waeq_HFAO6kNbbvg9zmJLwdJM8qD2YH5MH5O3',
    alt: 'Skydiving over coastline',
  },
  {
    title: 'Water Parks',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7YMoEx1gu5oZfOFtcpUkmYELGwq3Tl9T0QDU-OaQgiY6cKJvKglplAjiExFhFlqtGBYhcXfLFktb90frdMBJAebrY77t2QLW5DDTjSpcSUQF1yQWHLePYJHf3yMAgYBO13vijAeUH0zxUQqzMURIBFbNkjhlOLdgpORkMRj0-r6mjKZzxvLzzwP8LfCSVZ74PfgqY7EHl4M1kyFWn2DWWtBbjgodgjWNnCjIXMAGczlWL7ysrWPLi5ozuK5LSDmoUTz6FbyBpsG7d',
    alt: 'Luxury water park',
  },
  {
    title: 'Safaris',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYcpStgLhAun0S29Jk8G7e_bu2TXYjtIIROHqVzoNuWaOSjuy70atYPSpcBN_DpAsE-US55LwMAnGy1cvk5FxMzzaT8VCUQAQ2VhDjSaSkVahYcCBer6evKH8Ip7EeiOKsY3m0Y5nlNaKopBYUfoxwyodIPUSOjxzv8P6suCKU095lolzWWeJToKlNAaVHPHR6DsSzUMWQnya5k6C14gp3j0Y2oO_0gJcKN9K8yDDJFysc2Wvbmzf1Q5-Rt93zJSE8sAjEPAYclKRx',
    alt: 'Safari',
  },
  {
    title: 'Cultural Tours',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZDYQrhTzoca6Ivx7UmJuqEEuEVMSHHP18NqAwlba6enoTJnV0DQhGmDEP1yk11Hl-CgOkoaOvgtURSnVVWTHHrJa07jSK_cUwZX9KRTCMqUwOC2uQsf7blxHtNhJS9Cytpsg9FAH5PThv04GkXyBRrfO2cRmX-SpY91juXqhU4S_g7Ycc3hak_gwJJ2NJYGiceiUEDYvLl49ZLSwsNVXIrMlXCYVzO6dTP3yTsO6JJlrFYohPKKX_6v5_r0k_YGVo2LG03HYf_Jwu',
    alt: 'Cultural landmark',
  },
]

const USP_CARDS = [
  {
    icon: Verified,
    title: 'Professional',
    body: 'Our concierge team comprises industry veterans dedicated to the highest standards of hospitality.',
  },
  {
    icon: Shield,
    title: 'Secure',
    body: 'Your privacy and data security are our foundation. Transactional integrity without compromise.',
  },
  {
    icon: Sparkles,
    title: 'Personalized',
    body: 'No two itineraries are alike. We craft experiences around your individual pulse and preferences.',
  },
]

const SOCIAL_IMAGES: { src: string; alt: string }[] = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEGBjZvMJe7svo5LR8zATEn4O-Ti00jyuCFduDss7fvJbkUJxRL54RMNK-n0bb1s3ygXKHSv6OK_rpUeVWydYtIoPnWnJQi3HZH7KXOwzxGwhZFTpLw_m-jb2WX_mkM8gkUu4yqogvaqtc9rxKZy6F98XOPJKOdKjR1Qj7NniEF-70uQ0nNF98PV2my8hmG-TCVy77XbM7ln3PXBZweTIs6QFVL7uEnU9Hll1iCkkK_4hhqT2WPSxKhX203MkK6bfM5ApJGFBRPohk',
    alt: 'Luxury hotel lobby',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0Z5ncwsB4a48r1L0QOccTkeUdVRqaIVsQjRVpSiIRorEf0-0W_wdxd0k7vIn7TbUyQ3VQAOOrsFEEh-McLju2rEoWMTu99b1qvllEl18m5WdOa1X8ZRkhyuGwo0zrCtXIg1op736unPaELcSZrB9nYN7dwCBg_Jvq8mZ9hnVUrGye78lOzpujZ830WsZkyVpCgTyw8kbQtB13FmpWRRc-oS8W8WhTYx6KwkCgcph1Nhwajt4Dv3xYCu3yUg0vSlLS7Ag_gIzz0Le6',
    alt: 'Infinity pool',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCj1Bx-aWyXA5X0GfTfT3XhsamZZYaOqhyJuYU6plQFRC1sObldEu5fgwL-IQhWnGXjzUXJsJzDjtSkKQWFz8t8FwubnpEJdbMBnpTyKv4126peokF4yl7h2BKWWQy7nJNBdAU4srzfU06WiypuOSUWNy_tCtKh5rneVk5qEHHaCI-7zZOfQvfHQPBPzLReFFHAFLM4JekOc_KZ4efRYXOFwc3AXhYMgCUoFl9-7uQtXH6DqMqaCWgZbraeOrI_ZDpNB9F6izNLMcYw',
    alt: 'Breakfast with a view',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3x_VKUJCqcXZr3VgSoC0qL9MswnDictFwiUab25QfDb8rVlfiss7q56sNqHtyp8Z-2Z6voSTAbY42R1mS8FmUE4bjBNfp1TRS7U8-QYd8YayPdditFriZIGxK-fvM8ujyh4bCSpkAX-z6SOVtC2j8AmY4v2XxN7VDF17YuS-Yfrb765DqaI6lh-GJ1bITWx9_XA7snstdkktKdhKYrOsmedZvrd1a83mYW354uvh9dlbtW5LIgm7aLk2yvLi6LwCXp5mgS0ubWIvq',
    alt: 'Luxury bedroom view',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcQIaUTTg_brXBVkDBsxs_1GQAamTCqny2j4wrCfAISJ3_funcI8qAycr_JPZyLwA-TjUmY57-6GnHVTMVwOUGSqauq8SnJ5N7_TDLDEat2cTPB2zH66oUo5ECnzs714TioOPIf04ERxwdZ_t5EffEM2nrTFGUCsKbqtmI0f1R8cT9t0bPA65qpoQ1a5cSObfBJQd-wyflwvOp4nyZW2598sgrvnQBqGJBrqGO_shLD95Op-syxWg6o_IYcRsugZUerc5MWAMdGJfQ',
    alt: 'Spa interior',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBTaahmdLqU4o48MliZD8SMbQBMBNZxvWU0Fwm19_wUy0OOO4xIK0JqdEsa3gJUvt_300ybcLH7_awzQXbTNmS0-nDAAIifdutXCGEng_d14cqJKfWk8Ia0avyd2t1_uoQtlRw4GKPEg3s-QsdRqWb_89pk_yweWi3tnrRur-GcP3EVmEDxFf9G_zsFYTglF8RUIEJwDmOKflWxmerdGFOI4UlGZ8HztQQ7t9Bho1NsowGwJghk7LLgubwEBa8-gFlEPMI_hXqpQIB',
    alt: 'Dubai Palm at night',
  },
]

export function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const newsletterMutation = useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email).then((r) => r.data.data.message),
    onSuccess: (msg) => {
      toast({ title: 'Subscribed', description: msg, variant: 'success' })
      setNewsletterEmail('')
    },
    onError: () => {
      toast({
        title: 'Newsletter',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const { data: destinationsData } = useQuery({
    queryKey: ['destinations', { featured: true }],
    queryFn: () => destinationsApi.getAll({ featured: true }),
    select: (res) => res.data.data,
  })

  const destinations: Destination[] = destinationsData || []

  return (
    <>
      <SeoHelmet
        title="Starlings Hospitality | Where your travel dreams become reality"
        description="Luxury hospitality in Dubai and beyond — curated destinations, bespoke itineraries, and member-exclusive service."
      />

      <HeroCarousel />

      <section className="bg-[#fbf9f5] px-6 py-24 md:px-12 md:py-32" aria-label="Global destinations">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <span className="font-sans text-sm font-medium uppercase tracking-widest text-[#785a00]">
                Curated Collections
              </span>
              <h2 className="mt-4 font-display text-4xl text-[#1b1c1a] md:text-6xl">Global Destinations</h2>
            </div>
            <Link
              to="/destinations"
              className="font-sans font-medium text-[#041534] underline decoration-2 underline-offset-8 decoration-[#785a00] transition-all hover:decoration-[#041534]"
            >
              Explore All Destinations
            </Link>
          </div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              {destinations.slice(0, 6).map((dest, i) => (
                <LuxuryDestinationCard
                  key={dest.id}
                  destination={dest}
                  className={i === 1 ? 'md:mt-12 lg:mt-24' : ''}
                />
              ))}
            </div>
          ) : (
            <p className="text-center font-sans text-[#45464e]">Loading destinations…</p>
          )}
        </div>
      </section>

      <section className="overflow-hidden bg-[#041534] py-24 text-white" aria-label="Experiences">
        <div className="mb-12 px-6 md:px-12">
          <h2 className="font-display text-4xl italic">Limitless Experiences</h2>
        </div>
        <div className="no-scrollbar flex gap-8 overflow-x-auto px-6 pb-8 md:px-12">
          {EXPERIENCES.map((ex) => (
            <div
              key={ex.title}
              className="group relative h-96 w-80 shrink-0 overflow-hidden rounded-xl"
            >
              <img
                src={ex.image}
                alt={ex.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-end bg-black/40 p-8">
                <p className="font-display text-2xl italic">{ex.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#fbf9f5] px-6 py-24 md:px-12 md:py-32" aria-label="Why Starlings">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <span className="font-sans text-sm font-medium uppercase tracking-widest text-[#785a00]">
              Our Values
            </span>
            <h2 className="mt-6 font-display text-5xl leading-tight text-[#1b1c1a] md:text-7xl">
              Why Starlings is the <span className="italic text-[#785a00]">Premier Choice</span>
            </h2>
            <p className="mt-8 max-w-lg font-sans text-lg leading-relaxed text-[#45464e]">
              We don&apos;t just book travels; we curate legacies of experience. Our commitment to excellence ensures
              every journey is as unique as our guests.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {USP_CARDS.map((card, i) => (
              <div
                key={card.title}
                className={`flex gap-8 rounded-xl border border-[#c5c6cf]/20 bg-white p-10 shadow-sm ${
                  i === 1 ? 'lg:ml-12' : ''
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d9e2ff]">
                  <card.icon className="h-8 w-8 text-[#041534]" strokeWidth={1.25} />
                </div>
                <div>
                  <h4 className="mb-3 font-display text-2xl italic text-[#1b1c1a]">{card.title}</h4>
                  <p className="font-sans leading-relaxed text-[#45464e]">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#efeeea] py-24" aria-label="Social">
        <div className="mb-16 text-center">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#785a00]">Follow the Journey</p>
          <h2 className="mt-2 font-display text-4xl italic text-[#1b1c1a]">@StarlingsDubai</h2>
        </div>
        <div className="flex gap-2 overflow-x-hidden opacity-80 transition-opacity hover:opacity-100">
          {SOCIAL_IMAGES.map((item) => (
            <img
              key={item.src}
              src={item.src}
              alt={item.alt}
              className="aspect-square w-1/6 min-w-[120px] object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#041534] px-6 py-20 md:px-12" aria-label="Newsletter">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-12 md:flex-row">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-display text-3xl italic text-white">Stay in the Orbit</h3>
            <p className="mt-2 font-sans text-white/60">
              Get exclusive travel offers and destination guides delivered to your inbox.
            </p>
          </div>
          <form
            className="flex w-full flex-col gap-4 md:w-auto md:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              const v = newsletterEmail.trim()
              if (v) newsletterMutation.mutate(v)
            }}
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your Email Address"
              className="w-full border-0 border-b border-white/20 bg-white/5 px-6 py-4 font-light text-white placeholder:text-white/40 focus:border-[#785a00] focus:outline-none md:w-96"
              id="home-newsletter-email"
            />
            <button
              type="submit"
              disabled={newsletterMutation.isPending}
              className="whitespace-nowrap bg-[#785a00] px-8 py-4 font-sans font-bold tracking-widest text-white transition-all hover:bg-[#fdce5d] hover:text-[#745700] disabled:opacity-60"
            >
              {newsletterMutation.isPending ? '…' : 'SUBSCRIBE'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
