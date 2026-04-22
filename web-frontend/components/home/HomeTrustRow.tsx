import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Reliable delivery",
    body: "Trackable shipments and careful packaging so your order arrives as expected.",
  },
  {
    icon: ShieldCheck,
    title: "Curated sellers",
    body: "Products from verified marketplace partners with clear listings and support.",
  },
  {
    icon: RotateCcw,
    title: "Straightforward returns",
    body: "Need help with an order? Our help center walks you through returns and refunds.",
  },
];

const HomeTrustRow = () => {
  return (
    <section className="border-y border-stone-200/80 bg-stone-50/60">
      <div className="mx-auto max-w-screen-xl px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 md:text-xl">
            Shop with confidence
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            A calm, transparent experience from browse to doorstep.
          </p>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-stone-600 shadow-sm ring-1 ring-stone-200/80">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-stone-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-stone-400">
          Questions?{" "}
          <Link href="/help" className="font-medium text-stone-600 underline-offset-2 hover:underline">
            Visit the help center
          </Link>
        </p>
      </div>
    </section>
  );
};

export default HomeTrustRow;
