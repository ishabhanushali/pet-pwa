
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const categories = [
  {
    name: "Dog Food",
    icon: "🥣",
    color: "#FFF0D8",
    href: "/shop",
  },
  {
    name: "Cat Food",
    icon: "🐱",
    color: "#F4E7FF",
    href: "/shop",
  },
  {
    name: "Treats",
    icon: "🦴",
    color: "#FFE8D8",
    href: "/shop",
  },
  {
    name: "Dog Toys",
    icon: "🎾",
    color: "#E9F6DF",
    href: "/shop",
  },
  {
    name: "Cat Toys",
    icon: "🧶",
    color: "#FFE9EE",
    href: "/shop",
  },
  {
    name: "Cat Litter",
    icon: "🐾",
    color: "#E8F0FF",
    href: "/shop",
  },
  {
    name: "Pet ID",
    icon: "🏷️",
    color: "#FFF4C9",
    href: "/pets",
  },
  {
    name: "Rewards",
    icon: "🎁",
    color: "#E5F3EE",
    href: "/rewards",
  },
];

export default function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const firstCard =
        container.querySelector<HTMLElement>(
          "[data-category-card]"
        );

      if (!firstCard) return;

      const gap = 20;
      const step = firstCard.offsetWidth + gap;

      const maxScroll =
        container.scrollWidth - container.clientWidth;

      if (maxScroll <= 0) return;

      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        container.scrollBy({
          left: step,
          behavior: "smooth",
        });
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  function move(direction: "left" | "right") {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-category-card]"
      );

    const step = (firstCard?.offsetWidth ?? 150) + 20;

    container.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#1D4033] sm:text-2xl">
          Explore for Your Pet 🐾
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => move("left")}
            aria-label="Previous categories"
            className="rounded-full border border-[#E9D4D7] bg-white px-3 py-2 font-bold text-[#205D43] shadow-sm"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => move("right")}
            aria-label="Next categories"
            className="rounded-full border border-[#E9D4D7] bg-white px-3 py-2 font-bold text-[#205D43] shadow-sm"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            data-category-card
            className="group flex w-28 shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-36"
          >
            <div className="flex aspect-square w-full items-center justify-center rounded-full border-[3px] border-[#ECA2A8] p-1 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
              <div
                className="flex h-full w-full items-center justify-center rounded-full text-4xl sm:text-5xl"
                style={{
                  backgroundColor: category.color,
                }}
              >
                {category.icon}
              </div>
            </div>

            <span className="text-xs font-extrabold text-[#1D4033] sm:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
