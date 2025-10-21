import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'article' | 'book' | 'profile'
  data?: Record<string, any>
}

export function StructuredData({ type = 'website', data }: StructuredDataProps) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NoobWriter',
    description: 'NoobWriter is a global platform for writers and readers to publish, discover, and enjoy serialized web novels, light novels, manga, and fiction stories.',
    url: 'https://noobwriter.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://noobwriter.com/browse?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NoobWriter',
    url: 'https://noobwriter.com',
    logo: 'https://noobwriter.com/logo.png',
    sameAs: [
      'https://twitter.com/noobwriter',
      'https://facebook.com/noobwriter',
    ],
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://noobwriter.com',
      },
    ],
  }

  let schema: any = baseData
  if (type === 'article' && data) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      ...data,
    }
  } else if (type === 'book' && data) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Book',
      ...data,
    }
  }

  return (
    <>
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(baseData),
        }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      {type !== 'website' && (
        <Script
          id="structured-data-page"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      )}
    </>
  )
}

export function BookStructuredData({
  title,
  author,
  description,
  coverUrl,
  genre,
  datePublished,
  url,
}: {
  title: string
  author: string
  description: string
  coverUrl?: string
  genre?: string
  datePublished?: string
  url: string
}) {
  const bookData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: title,
    author: {
      '@type': 'Person',
      name: author,
    },
    description: description,
    ...(coverUrl && { image: coverUrl }),
    ...(genre && { genre: genre }),
    ...(datePublished && { datePublished: datePublished }),
    url: url,
    publisher: {
      '@type': 'Organization',
      name: 'NoobWriter',
    },
  }

  return (
    <Script
      id="book-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(bookData),
      }}
    />
  )
}

export function ArticleStructuredData({
  headline,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: {
  headline: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  url: string
}) {
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline,
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: datePublished,
    ...(dateModified && { dateModified: dateModified }),
    ...(image && { image: image }),
    url: url,
    publisher: {
      '@type': 'Organization',
      name: 'NoobWriter',
      logo: {
        '@type': 'ImageObject',
        url: 'https://noobwriter.com/logo.png',
      },
    },
  }

  return (
    <Script
      id="article-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleData),
      }}
    />
  )
}
