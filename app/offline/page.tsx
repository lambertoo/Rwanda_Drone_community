'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">✈️</div>
        <h1 className="text-2xl font-bold">You're offline</h1>
        <p className="text-muted-foreground">
          No internet connection detected. Some pages you've visited before may still be available.
        </p>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again, or navigate to a page you've visited before.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
