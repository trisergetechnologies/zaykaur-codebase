/**
 * Fallback while other auth routes load (sign-up, forgot-password).
 * Sign-in uses its own loading.tsx + the same shell as the page for zero layout flash.
 */
export default function AuthSegmentLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-8 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6">
        <div className="mx-auto h-10 w-48 animate-pulse rounded-lg bg-muted lg:mx-0" />
        <div className="h-12 w-full animate-pulse rounded-md border border-input bg-muted/30" />
        <div className="h-12 w-full animate-pulse rounded-md border border-input bg-muted/30" />
        <div className="h-12 w-full animate-pulse rounded-md bg-muted/50" />
      </div>
    </div>
  );
}
