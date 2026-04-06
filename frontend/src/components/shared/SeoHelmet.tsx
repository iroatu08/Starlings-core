import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

interface SeoHelmetProps {
  title: string
  description?: string
  image?: string
  url?: string
}

export function SeoHelmet({ title, description, image, url }: SeoHelmetProps) {
  const fullTitle = `${title} | Starlings Hospitality`
  const desc = description || 'Where your travel dreams become reality. Premium travel packages to France, UK, Nigeria, USA, UAE, and Canada.'
  const ogImage = image || 'https://starlingshosp.com/og-image.jpg'
  const canonical = url || window.location.href

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
