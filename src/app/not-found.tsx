import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-8xl font-bold text-accent mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
            Try searching for dams or browse our database.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <Link
              href="/state"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              <Search className="h-4 w-4" />
              Browse States
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
