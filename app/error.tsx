'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, RefreshCw, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Error Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Something went wrong!</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Our team has been notified of this issue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={reset} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Error Details (Development)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-left">
                <p className="text-xs font-mono bg-muted p-2 rounded">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Help */}
        <div className="mt-6 text-sm text-muted-foreground">
          <p>If this problem continues, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
} 