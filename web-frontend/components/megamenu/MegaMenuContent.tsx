"use client";

import Link from "next/link";

interface MenuColumn {
  columnTitle: string;
  items: string[];
}

interface Props {
  data: MenuColumn[];
  basePath: string;
}

export default function MegaMenuContent({ data, basePath }: Props) {
  return (
    <div className="grid grid-cols-4 gap-x-12 gap-y-6">
      {data.map((col) => (
        <div key={col.columnTitle}>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-pink-600">
            {col.columnTitle}
          </h4>

          <ul className="space-y-2">
            {col.items.map((item) => (
              <li key={item}>
                <Link
                  href={`/${basePath}/${slugify(item)}`}
                  className="text-sm text-gray-700 hover:text-black transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
