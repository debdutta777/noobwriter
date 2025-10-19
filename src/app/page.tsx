import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Sparkles, TrendingUp } from 'lucide-react'

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

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
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
      <section className="py-20">
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
