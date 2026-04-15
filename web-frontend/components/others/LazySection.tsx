"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  children: ReactNode;
  /** Height of the placeholder before the section loads */
  height?: string;
  /** How far before the viewport edge to trigger loading */
  rootMargin?: string;
  className?: string;
};

const LazySection = ({
  children,
  height = "400px",
  rootMargin = "200px",
  className = "",
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (visible) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} style={{ minHeight: height }}>
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="w-full max-w-[1600px] px-3 lg:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 sm:space-y-3">
                <Skeleton className="aspect-square sm:aspect-[4/5] w-full rounded-2xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LazySection;
