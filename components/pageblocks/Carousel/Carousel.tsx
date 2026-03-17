"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { AppConstants } from "@/constants/constants";
import { getMediaUrl } from "@/utils/media_url";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface CarouselProps {
  slides: { image: string; link?: string }[];
  blockType: string;
  hasPadding?: boolean;
  backgroundColor?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  slides,
  blockType,
  hasPadding = false,
  backgroundColor,
}) => {
  const heightClass =
    {
      CAROUSEL_1_3: "h-[33vh]",
      CAROUSEL_1_2: "h-[50vh]",
      CAROUSEL_FULL: "h-[100vh]",
    }[blockType] || "h-[50vh]";

  if (!slides || slides.length === 0) {
    return (
      <div
        className={`w-full ${heightClass} bg-gray-100 flex items-center justify-center ${
          hasPadding ? "max-w-7xl mx-auto px-6 rounded-2xl" : ""
        }`}
      >
        <p className="text-gray-400">Carousel - Add slides in admin</p>
      </div>
    );
  }

  return (
    <section
      className={`relative group ${
        hasPadding ? "max-w-7xl mx-auto px-6 py-8" : "w-full"
      }`}
      style={{ backgroundColor }}
    >
      <div
        className={`${heightClass} overflow-hidden ${
          hasPadding ? "rounded-3xl shadow-lg" : ""
        }`}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={slides.length > 1}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="w-full h-full">
              {slide.link ? (
                <Link
                  href={slide.link}
                  className="block w-full h-full relative cursor-pointer"
                >
                  <img
                    src={getMediaUrl(slide.image)}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={getMediaUrl(slide.image)}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(0, 0, 0, 0.2);
          width: 50px !important;
          height: 50px !important;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 20px !important;
          font-weight: bold;
        }
        .group:hover .swiper-button-next,
        .group:hover .swiper-button-prev {
          opacity: 1;
        }
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </section>
  );
};

export default Carousel;
