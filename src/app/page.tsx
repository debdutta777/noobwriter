import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Clock, Star, TrendingUpIcon, Users, Zap } from 'lucide-react'
import { getHomepageData } from '@/app/actions/homepage-actions'
import SeriesCard from '@/components/series/SeriesCard'
import { createClient } from '@/lib/supabase/server'
import { StructuredData } from '@/components/seo/structured-data'

export const revalidate = 120

function HomepageSections({ data }: { data: Awaited<ReturnType<typeof getHomepageData>> }) {
  return (
    <>
      {/* Recommended Section */}
      {data.recommended.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  <Star className="w-8 h-8 text-purple-600" />
                  Recommended for You
                </h2>
                <p className="text-muted-foreground mt-2">Top-rated stories you might love</p>
              </div>
              <Button variant="outline" asChild className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
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
                <h2 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                  <Clock className="w-8 h-8 text-blue-600" />
                  Recently Updated
                </h2>
                <p className="text-muted-foreground mt-2">Fresh chapters just dropped</p>
              </div>
              <Button variant="outline" asChild className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
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
        <section className="py-16 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                <TrendingUpIcon className="w-8 h-8 text-pink-600" />
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

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: { user } }, heroData] = await Promise.all([
    supabase.auth.getUser(),
    getHomepageData(),
  ])

  const heroCovers = [
    ...heroData.recommended,
    ...heroData.recentlyUpdated,
  ]
    .filter((s) => s.cover_url)
    .slice(0, 10)

  return (
    <>
      <StructuredData type="website" />
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-500/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

        <div className="container mx-auto px-4 pt-20 pb-12 lg:pt-28 lg:pb-16 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
                <Zap className="w-3 h-3" /> New chapters daily
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
                Stories you&apos;ll
                <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  lose sleep over.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Discover webnovels and manga from writers around the world. Unlock premium
                chapters with coins, tip creators, and publish your own series.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button size="lg" asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
                  <Link href="/browse">
                    Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/write">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Become a Writer
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 max-w-md">
                <HeroStat icon={<BookOpen className="w-4 h-4" />} label="Stories" value={heroData.recommended.length + heroData.recentlyUpdated.length > 0 ? '100+' : '—'} />
                <HeroStat icon={<Users className="w-4 h-4" />} label="Readers" value="Growing" />
                <HeroStat icon={<Sparkles className="w-4 h-4" />} label="Daily drops" value="Fresh" />
              </div>
            </div>

            {heroCovers.length > 0 && (
              <div className="relative hidden lg:block h-[520px]">
                <div className="absolute inset-0 grid grid-cols-3 gap-3 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
                  {[0, 1, 2].map((col) => (
                    <div
                      key={col}
                      className="flex flex-col gap-3 animate-marquee-y"
                      style={{
                        animationDelay: `${col * -6}s`,
                        animationDuration: '28s',
                      }}
                    >
                      {[...heroCovers, ...heroCovers].map((s, i) => (
                        <div
                          key={`${col}-${i}`}
                          className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl shadow-black/20 ring-1 ring-white/10"
                        >
                          {s.cover_url && (
                            <Image
                              src={s.cover_url}
                              alt={s.title}
                              fill
                              sizes="180px"
                              className="object-cover"
                              priority={col === 0 && i < 2}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Content Sections */}
      <HomepageSections data={heroData} />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-purple-500/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Why Choose NoobWriter?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-purple-600" />}
              title="Vast Library"
              description="Access thousands of webnovels and manga across all genres. New chapters published daily."
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10 text-blue-600" />}
              title="Premium Content"
              description="Unlock exclusive chapters with coins or subscribe for unlimited access to premium stories."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-pink-600" />}
              title="Earn Money"
              description="Writers earn from reader purchases, tips, and subscriptions. Turn your passion into income."
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged in users */}
      {!user && (
        <section className="py-20 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-pink-600/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Ready to Start Your Journey?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Sign up now and get 5 free coins to unlock your first chapters!
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </section>
      )}
      </div>
    </>
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
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20 group">
      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-l-2 border-primary/30 pl-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
