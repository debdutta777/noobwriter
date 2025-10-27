import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="h-16 w-16 text-primary" />
              <CheckCircle2 className="h-8 w-8 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent you a confirmation email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground/80">
              Please check your inbox and click the confirmation link to verify your email address and activate your account.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Check your spam folder</p>
                <p className="text-xs text-muted-foreground">
                  If you don't see the email, it might be in your spam or junk folder.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Email from NoobWriter</p>
                <p className="text-xs text-muted-foreground">
                  Look for an email from <strong>noreply@noobwriter.in</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Link expires in 24 hours</p>
                <p className="text-xs text-muted-foreground">
                  Click the confirmation link within 24 hours to verify your account.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                  Didn't receive the email?
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Wait a few minutes and check your spam folder. If you still don't see it, you can try signing up again or contact support at <strong>info@noobwriter.in</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/">
              Return to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
