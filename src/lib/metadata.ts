import { Metadata } from 'next'

export const siteConfig = {
  name: 'NoobWriter',
  title: 'NoobWriter - Read & Write WebNovels, Light Novels and Manga Online',
  description: 'NoobWriter is a global platform for writers and readers to publish, discover, and enjoy serialized web novels, light novels, manga, and fiction stories. Join our community of authors and readers.',
  url: 'https://noobwriter.com',
  ogImage: 'https://noobwriter.com/og-image.png',
  author: 'NoobWriter Team',
  keywords: [
    'noobwriter',
    'webnovel',
    'web novel',
    'light novel',
    'manga',
    'fiction',
    'reading platform',
    'writing platform',
    'serialized stories',
    'online reading',
    'publish stories',
    'free novels',
    'fantasy novels',
    'romance novels',
    'web fiction',
    'creative writing',
    'story publishing',
    'novel platform',
    'manga reader',
    'webnovel reader',
  ],
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@noobwriter',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteConfig.url,
  },
  category: 'entertainment',
}

export function generatePageMetadata({
  title,
  description,
  image,
  path = '',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const url = `${siteConfig.url}${path}`
  const ogImage = image || siteConfig.ogImage

  return {
    title: title || siteConfig.title,
    description: description || siteConfig.description,
    openGraph: {
      type: 'website',
      url,
      title: title || siteConfig.title,
      description: description || siteConfig.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || siteConfig.title,
      description: description || siteConfig.description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  }
}
