import Link from "next/link";

export default function MobileAppPage() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-purple-50/80 to-slate-50/80 px-4 py-12 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-purple-100/80 bg-white/95 p-10 text-center shadow-sm backdrop-blur-sm md:p-14">
        <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">
          ZAYKAUR
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Mobile app
        </h1>
        <p className="mt-4 text-gray-600">
          Our native apps for iOS and Android are on the way. You will get the
          same curated catalog, secure checkout, and order tracking—optimized
          for your phone.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          Until then, add ZAYKAUR to your home screen from the browser menu for
          a faster shortcut.
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-flex rounded-full bg-pink-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
        >
          Continue shopping on web
        </Link>
      </div>
    </div>
  );
}
