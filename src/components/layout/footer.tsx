import Link from 'next/link'
import { BookOpen, Mail, Twitter, Facebook, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">NoobWriter</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The ultimate platform for reading and publishing web novels and manga.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Readers */}
          <div>
            <h3 className="font-semibold mb-4">For Readers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse All
                </Link>
              </li>
              <li>
                <Link href="/novels" className="text-muted-foreground hover:text-primary transition-colors">
                  Novels
                </Link>
              </li>
              <li>
                <Link href="/manga" className="text-muted-foreground hover:text-primary transition-colors">
                  Manga
                </Link>
              </li>
              <li>
                <Link href="/library" className="text-muted-foreground hover:text-primary transition-colors">
                  My Library
                </Link>
              </li>
              <li>
                <Link href="/coins" className="text-muted-foreground hover:text-primary transition-colors">
                  Buy Coins
                </Link>
              </li>
            </ul>
          </div>

          {/* For Writers */}
          <div>
            <h3 className="font-semibold mb-4">For Writers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/write" className="text-muted-foreground hover:text-primary transition-colors">
                  Start Writing
                </Link>
              </li>
              <li>
                <Link href="/write/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Writer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/write/earnings" className="text-muted-foreground hover:text-primary transition-colors">
                  Earnings
                </Link>
              </li>
              <li>
                <Link href="/write/analytics" className="text-muted-foreground hover:text-primary transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/write/guide" className="text-muted-foreground hover:text-primary transition-colors">
                  Writer's Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors">
                  Content Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NoobWriter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
