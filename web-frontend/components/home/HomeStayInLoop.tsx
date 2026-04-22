import Link from "next/link";
import { Mail, Smartphone } from "lucide-react";

const HomeStayInLoop = () => {
  return (
    <section className="border-t border-stone-200/80 bg-stone-50/40">
      <div className="mx-auto max-w-screen-xl px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 md:text-xl">
            Stay in the loop
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            We are building a richer experience — from curated drops to a faster mobile app.
            In the meantime, reach out anytime or read updates on our blog.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-lg gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 text-left shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Mail className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-stone-900">Contact & support</h3>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Order questions, partnerships, or feedback — we read every message.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-block text-sm font-medium text-stone-800 underline-offset-2 hover:underline"
            >
              Contact us
            </Link>
          </div>
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 text-left shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Smartphone className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-stone-900">Mobile app</h3>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Native apps are on the roadmap for a smoother checkout and order tracking.
            </p>
            <Link
              href="/blog"
              className="mt-3 inline-block text-sm font-medium text-stone-800 underline-offset-2 hover:underline"
            >
              Read the blog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeStayInLoop;
