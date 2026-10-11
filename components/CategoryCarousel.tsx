
"use client";

import { useRef } from "react";
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

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#FFFCF8] py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HEADING AND ARROWS */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-[#194532] sm:text-3xl">
            Explore for Your Pet 🐾
          </h2>

          {/* Arrows visible only on smaller screens */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll categories left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F3D2D5] bg-white text-[#205D43] shadow-sm"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll categories right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F3D2D5] bg-white text-[#205D43] shadow-sm"
            >
              →
            </button>
          </div>
        </div>

        {/* CATEGORY CIRCLES */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7 lg:justify-center lg:gap-8 lg:overflow-visible"
        >
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group flex w-[145px] shrink-0 flex-col items-center text-center sm:w-[160px] lg:w-[170px]"
            >
              <div className="flex aspect-square w-full items-center justify-center rounded-full border-[3px] border-[#F5A4AF] bg-white p-[5px] shadow-sm transition-transform duration-300 group-hover:-translate-y-2">
                <div
                  className="flex h-full w-full items-center justify-center rounded-full text-5xl"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
              </div>

              <p className="mt-4 whitespace-nowrap text-base font-black text-[#194532] sm:text-lg">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
