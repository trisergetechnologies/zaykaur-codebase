import Link from "next/link";

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-purple-50/80 to-slate-50/80 px-4 py-12 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-purple-100/80 bg-white/95 p-8 shadow-sm backdrop-blur-sm md:p-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">
          Policies
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Returns &amp; refunds
        </h1>
        <p className="mt-4 text-gray-600">
          We want you to love every ZAYKAUR purchase. Here is how returns and
          refunds work on our marketplace.
        </p>

        <div className="mt-10 space-y-8 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Eligibility
            </h2>
            <p className="mt-2 leading-relaxed">
              Most items can be returned within the return window stated on the
              product or order details, in original condition with tags and
              packaging where applicable. Certain categories (for example
              personalised or hygiene-sensitive products) may be marked
              non-returnable at checkout.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              2. How to start a return
            </h2>
            <p className="mt-2 leading-relaxed">
              Signed-in customers can open a return from{" "}
              <Link href="/orders" className="font-medium text-pink-600 hover:underline">
                Your orders
              </Link>
              . If you need help, visit our{" "}
              <Link href="/help" className="font-medium text-pink-600 hover:underline">
                Help center
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="font-medium text-pink-600 hover:underline">
                Contact us
              </Link>
              .
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              3. Refunds
            </h2>
            <p className="mt-2 leading-relaxed">
              After we receive and inspect your return, refunds are issued to
              the original payment method where possible. Timelines can depend
              on your bank or payment provider.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
