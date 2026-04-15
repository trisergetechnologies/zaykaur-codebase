import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthSignInShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-pink-600 p-12 lg:flex">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-pink-500 opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-48 w-48 rounded-full bg-pink-700 opacity-50" />

        <div className="relative z-10 max-w-md space-y-6 text-white">
          <h1 className="text-5xl font-extrabold tracking-tight">Welcome Back!</h1>
          <p className="text-lg leading-relaxed text-pink-100">
            Log in to access your orders, personalized recommendations, and saved
            items.
          </p>
          <div className="pt-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium transition-colors hover:text-pink-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-8 sm:p-8 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
