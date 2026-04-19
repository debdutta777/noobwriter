import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <Link href="/">
            <Button>Go home</Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Browse stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
