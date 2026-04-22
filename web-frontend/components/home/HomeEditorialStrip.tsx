import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const stories = [
  {
    title: "Occasion-ready",
    subtitle: "Wedding & festive edits",
    href: "/shop?category=fashion",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  },
  {
    title: "Everyday elegance",
    subtitle: "Comfortable staples",
    href: "/shop?category=kids",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78a?w=800&q=80",
  },
  {
    title: "Complete the look",
    subtitle: "Accessories & more",
    href: "/shop?category=beauty",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
  },
];

const HomeEditorialStrip = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-14 md:px-6 md:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 md:text-xl">
              Shop the look
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Curated starting points — explore full ranges in the shop.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-stone-800 sm:mt-0 hover:underline"
          >
            View all
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stories.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-200/80 transition hover:ring-stone-300"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={s.image}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                    {s.subtitle}
                  </p>
                  <p className="mt-0.5 text-base font-semibold tracking-tight">{s.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeEditorialStrip;
