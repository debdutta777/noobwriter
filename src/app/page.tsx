import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Clock, Star, TrendingUpIcon } from 'lucide-react'
import { getHomepageData } from '@/app/actions/homepage-actions'
import SeriesCard from '@/components/series/SeriesCard'
import { Suspense } from 'react'

async function HomepageSections() {
  const data = await getHomepageData()

  return (
    <>
      {/* Recommended Section */}
      {data.recommended.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Star className="w-8 h-8 text-primary" />
                  Recommended for You
                </h2>
                <p className="text-muted-foreground mt-2">Top-rated stories you might love</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/browse">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.recommended.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Updates Section */}
      {data.recentlyUpdated.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Clock className="w-8 h-8 text-primary" />
                  Recently Updated
                </h2>
                <p className="text-muted-foreground mt-2">Fresh chapters just dropped</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/browse?sort=updated">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.recentlyUpdated.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Rankings */}
      {data.categoryRankings.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUpIcon className="w-8 h-8 text-primary" />
                Top by Category
              </h2>
              <p className="text-muted-foreground mt-2">Popular stories in each genre</p>
            </div>
            <div className="space-y-12">
              {data.categoryRankings.map((category) => (
                <div key={category.genre}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">{category.genre}</h3>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/browse?genre=${category.genre}`}>
                        View More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {category.series.map((series) => (
                      <SeriesCard key={series.id} series={series} compact />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Read & Write Stories
              <span className="block text-primary">That Matter</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join millions of readers and writers in the world's largest community
              for webnovels and manga. Discover your next favorite story or publish your own.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/browse">
                  Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/write">Become a Writer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Sections */}
      <Suspense fallback={
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading stories...</p>
        </div>
      }>
        <HomepageSections />
      </Suspense>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose NoobWriter?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-primary" />}
              title="Vast Library"
              description="Access thousands of webnovels and manga across all genres. New chapters published daily."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-primary" />}
              title="Premium Content"
              description="Unlock exclusive chapters with coins or subscribe for unlimited access to premium stories."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Earn Money"
              description="Writers earn from reader purchases, tips, and subscriptions. Turn your passion into income."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Sign up now and get 100 free coins to unlock your first chapters!
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
