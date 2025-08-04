import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-destructive font-bold text-4xl">404</span>
          </div>
        </div>

        {/* Error Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You might have typed the wrong address or the page has been moved to a new location.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-sm text-muted-foreground">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  )
} 