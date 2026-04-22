import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-purple-50/80 to-slate-50/80 px-4 py-12 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-purple-100/80 bg-white/95 p-8 shadow-sm backdrop-blur-sm md:p-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">
          Policies
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Shipping information
        </h1>
        <p className="mt-4 text-gray-600">
          Transparent delivery expectations for orders placed on ZAYKAUR.
        </p>

        <div className="mt-10 space-y-8 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Where we ship
            </h2>
            <p className="mt-2 leading-relaxed">
              We ship across India unless otherwise stated at checkout. Remote
              or service-limited pin codes may see slightly longer timelines.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. Processing &amp; delivery
            </h2>
            <p className="mt-2 leading-relaxed">
              Orders are typically processed within 1–2 business days. Delivery
              estimates are shown before you pay and may vary by seller,
              product, and your location.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Tracking
            </h2>
            <p className="mt-2 leading-relaxed">
              Once your order ships, tracking details appear in{" "}
              <Link href="/orders" className="font-medium text-pink-600 hover:underline">
                Your orders
              </Link>
              . You need to be signed in to view order updates.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              4. Fees
            </h2>
            <p className="mt-2 leading-relaxed">
              Shipping charges, if any, are displayed at checkout. Promotional
              free shipping may apply on eligible carts or campaigns.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-gray-500">
          Questions?{" "}
          <Link href="/help" className="font-medium text-pink-600 hover:underline">
            Visit the help center
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
