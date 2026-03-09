"use client";

import React from "react";
import { Star } from "lucide-react";
import { Carousel } from "antd";

const reviews = [
  {
    text: "The oud collection is absolutely mesmerizing. It lingers on the skin all day and I always get compliments when I'm at the mall. Truly the best fragrance shopping experience in Dubai!",
    author: "Fatima Al Mansoori",
    location: "Dubai, UAE",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    text: "I was looking for a signature scent that blends traditional Arabian notes with a modern twist. Serenique delivered exactly that. The packaging is luxurious and perfect for gifting.",
    author: "Omar Al Qasimi",
    location: "Sharjah, UAE",
    image: "https://randomuser.me/api/portraits/men/43.jpg",
  },
  {
    text: "Exceptional quality and fast delivery to Abu Dhabi. The perfume oils are highly concentrated and authentic. I'll definitely be purchasing my daily wear fragrances from here again.",
    author: "Aisha Sultan",
    location: "Abu Dhabi, UAE",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

export default function Testinomials() {
  return (
    <section className="bg-[#FDF8F5] py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-serif mb-12 relative inline-block text-[#4A3B32]">
        Client Reviews
        <span className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#E8D4C5]/30 rounded-full blur-xl"></span>
      </h2>

      <div className="max-w-4xl mx-auto px-4">
        <Carousel autoplay effect="fade" dotPlacement="bottom">
          {reviews.map((review, idx) => (
            <div key={idx} className="pb-12">
              <div className="flex justify-center gap-1 text-[#DFA048] mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="max-w-2xl mx-auto text-xl font-serif leading-relaxed text-[#4A3B32] px-4">
                "{review.text}"
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-3">
                <img
                  src={review.image}
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  alt={review.author}
                />
                <div className="text-left">
                  <div className="text-sm font-bold text-[#4A3B32]">
                    {review.author}
                  </div>
                  <div className="text-xs text-gray-500">{review.location}</div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
