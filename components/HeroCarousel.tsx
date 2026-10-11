
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    title: "Everything for Happy Paws!",
    description:
      "Food, treats and everyday essentials for your furry family.",
    button: "Shop Now",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85",
    background: "#FFF3E5",
    imageBackground: "#F6DFC6",
  },
  {
    title: "A World Made for Cats!",
    description:
      "Something special for every curious little cat.",
    button: "Shop for Cats",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=85",
    background: "#EEF5E8",
    imageBackground: "#DCEBD8",
  },
  {
    title: "Little Treats, Big Smiles!",
    description:
      "Make playtime even more special for your best friend.",
    button: "Explore Treats",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=85",
    background: "#FFF0E7",
    imageBackground: "#F8DFD2",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((previous) => (previous + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrent(
      (previous) =>
        (previous - 1 + slides.length) % slides.length
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Pet PWA promotional banners"
    >
      <div className="relative min-h-[590px] sm:min-h-[460px] lg:min-h-[490px]">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            aria-hidden={current !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              current === index
                ? "z-10 opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            style={{ backgroundColor: slide.background }}
          >
            <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-5 px-10 py-12 sm:grid-cols-2 sm:gap-8 sm:px-14 lg:px-20">

              {/* LEFT SIDE: TEXT */}
              <div className="relative z-10 flex flex-col items-start justify-center">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#C56B35]">
                  🐾 PET PWA FAVOURITES
                </p>

                <h2 className="max-w-xl text-3xl font-black leading-tight text-[#194532] sm:text-4xl lg:text-6xl">
                  {slide.title}
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-[#536E60] sm:text-base sm:leading-7">
                  {slide.description}
                </p>

                <Link
                  href={slide.href}
                  tabIndex={current === index ? 0 : -1}
                  className="mt-6 inline-flex items-center rounded-xl bg-[#205D43] px-6 py-3 text-sm font-black text-white transition hover:bg-[#174934] sm:px-8 sm:py-4"
                >
                  {slide.button} →
                </Link>
              </div>

              {/* RIGHT SIDE: FULL PET PHOTO */}
              <div className="flex h-[240px] min-w-0 items-center justify-center sm:h-[340px] lg:h-[390px]">
                <div
                  className="relative h-full w-full overflow-hidden rounded-[2rem] p-3 shadow-xl sm:rounded-[2.5rem]"
                  style={{
                    backgroundColor: slide.imageBackground,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full rounded-[1.5rem] object-contain object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIOUS ARROW */}
      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous banner"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl text-[#205D43] shadow-lg hover:bg-white sm:left-4"
      >
        ‹
      </button>

      {/* NEXT ARROW */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next banner"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl text-[#205D43] shadow-lg hover:bg-white sm:right-4"
      >
        ›
      </button>

      {/* NAVIGATION DOTS */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show banner ${index + 1}`}
            aria-current={current === index ? "true" : undefined}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all ${
              current === index
                ? "w-8 bg-[#205D43]"
                : "w-2.5 bg-[#B5C6B9]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
