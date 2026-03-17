"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { StarFilled } from "@ant-design/icons";
import { AppConstants } from "@/constants/constants";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Testimonial {
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  backgroundColor?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({
  title = "What Our Client Says",
  subtitle = "Our business is one of close relationships and we are very fortunate to be able to share so many positive experiences with our clients.",
  testimonials = [],
  backgroundColor,
}) => {
  return (
    <section className="py-24" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <span className="text-[#FF5A5F] font-bold tracking-[0.3em] uppercase text-sm mb-4 block">
          Testimonial
        </span>
        <h2 className="text-5xl font-extrabold text-[#333333] mb-6">{title}</h2>
        {subtitle && (
          <p className="max-w-2xl mx-auto text-gray-500 text-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative testimonial-slider">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            prevEl: ".testimonial-prev",
            nextEl: ".testimonial-next",
          }}
          pagination={{
            clickable: true,
            el: ".testimonial-pagination",
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white p-10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col items-start text-left hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="flex mb-6">
                  {[...Array(5)].map((_, idx) => (
                    <StarFilled
                      key={idx}
                      className={`text-lg ${
                        idx < t.rating ? "text-[#FF5A5F]" : "text-gray-200"
                      } mr-1`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 grow">
                  {t.content}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  {t.avatar && (
                    <img
                      src={
                        t.avatar.startsWith("http")
                          ? t.avatar
                          : `${AppConstants.DRIVE_ROOT_URL}/${t.avatar}`
                      }
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#FF5A5F]/10"
                    />
                  )}
                  <div>
                    <div className="font-bold text-gray-900 text-xl mb-0.5">
                      {t.name}
                    </div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button className="testimonial-prev w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-[#FF5A5F] hover:bg-[#FF5A5F] hover:text-white transition-all cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="testimonial-pagination flex gap-2 w-auto!"></div>

          <button className="testimonial-next w-12 h-12 rounded-full bg-[#FF5A5F] flex items-center justify-center text-white shadow-lg shadow-[#FF5A5F]/20 hover:scale-110 transition-all cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .testimonial-slider .swiper-slide {
          height: auto;
          display: flex;
        }
        .testimonial-pagination .swiper-pagination-bullet {
          width: 32px;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          opacity: 1;
          transition: all 0.3s ease;
        }
        .testimonial-pagination .swiper-pagination-bullet-active {
          background: #ff5a5f;
          width: 48px;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
