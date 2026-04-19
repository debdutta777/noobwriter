import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Clock, Star, Flame, Users, Zap } from 'lucide-react'
import { getHomepageData } from '@/app/actions/homepage-actions'
import SeriesCard from '@/components/series/SeriesCard'
import { createClient } from '@/lib/supabase/server'
import { StructuredData } from '@/components/seo/structured-data'

export const revalidate = 120

function SectionHeader({
  icon,
  title,
  subtitle,
  href,
  accent = 'text-primary',
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  href?: string
  accent?: string
}) {
  return (
    <div className="flex items-end justify-between mb-8 gap-4">
      <div className="min-w-0">
        <div className={`inline-flex items-center gap-2 ${accent} mb-2`}>
          {icon}
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">{subtitle}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      {href && (
        <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
          <Link href={href}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}

function HomepageSections({ data }: { data: Awaited<ReturnType<typeof getHomepageData>> }) {
  return (
    <>
      {/* Recommended Section */}
      {data.recommended.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<Star className="w-4 h-4" />}
              subtitle="Editor picks"
              title="Recommended for you"
              href="/browse"
              accent="text-amber-500"
            />
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
        <section className="py-16 border-t border-border/60">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<Clock className="w-4 h-4" />}
              subtitle="Fresh drops"
              title="Recently updated"
              href="/browse?sort=updated"
              accent="text-sky-500"
            />
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
        <section className="py-16 border-t border-border/60 bg-muted/20">
          <div className="container mx-auto px-4">
            <SectionHeader
              icon={<Flame className="w-4 h-4" />}
              subtitle="By genre"
              title="Top of the charts"
              accent="text-rose-500"
            />
            <div className="space-y-12">
              {data.categoryRankings.map((category) => (
                <div key={category.genre}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold tracking-tight">{category.genre}</h3>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/browse?genre=${category.genre}`}>
                        More <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
      <section className="py-20 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">Why NoobWriter</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              A home for serialized fiction
            </h2>
            <p className="text-muted-foreground mt-3">
              Built for readers who binge and writers who grind.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              accent="from-purple-500/20 to-purple-500/5 text-purple-500"
              title="Vast library"
              description="Thousands of webnovels and manga across every genre. New chapters every single day."
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              accent="from-sky-500/20 to-sky-500/5 text-sky-500"
              title="Premium chapters"
              description="Unlock advance chapters with coins. Subscribe for unlimited access to your favorites."
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              accent="from-rose-500/20 to-rose-500/5 text-rose-500"
              title="Earn from your work"
              description="Keep the majority of earnings from reader purchases, tips, and subscriptions."
            />
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged in users */}
      {!user && (
        <section className="py-24 border-t border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_60%)]" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Start reading in 10 seconds.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Sign up and we'll drop 5 free coins in your wallet. Unlock your first premium chapter on us.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
                <Link href="/signup">Get started free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/browse">Browse first</Link>
              </Button>
            </div>
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
  accent,
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent: string
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-card ring-1 ring-border/60 hover:ring-border transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${accent} ring-1 ring-border/40 mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
