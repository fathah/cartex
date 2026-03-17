"use client";

import React from "react";
import Link from "next/link";
import { AppConstants } from "@/constants/constants";

interface HeroModernProps {
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  backgroundColor?: string;
}

const HeroModern: React.FC<HeroModernProps> = ({
  title = "Unleash Your Online Potential with Our Creative Web Agency",
  description = "Let our creative web agency help you reach new heights online. From custom web design to development services, we've got the skills and experience to bring your vision to life. Contact us today to get started.",
  primaryCtaText = "Get in Touch",
  primaryCtaLink = "#",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "#",
  imageUrl = "https://framerusercontent.com/images/4O8s4G4G4G4G4G4G4G4G.png", // Placeholder for 3D illustration
  backgroundColor,
}) => {
  return (
    <section
      className={`relative min-h-[800px] flex items-center justify-center py-20 px-6 overflow-hidden ${
        backgroundColor
          ? ""
          : "bg-[radial-gradient(circle_at_top_left,#ff0055_0%,#00aaff_50%,#ffaa00_100%)]"
      }`}
      style={{ backgroundColor }}
    >
      {/* Animated background shapes could go here for more "WOW" effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl w-full bg-white/95 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row items-center p-12 md:p-20 border border-white/20 backdrop-blur-sm">
        {/* Left Content */}
        <div className="flex-1 text-left md:pr-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1a1a1a] mb-8 leading-[1.1] tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-xl">
            {description}
          </p>

          <div className="flex flex-wrap gap-5 mt-4">
            {primaryCtaText && primaryCtaLink && (
              <Link
                href={primaryCtaLink}
                className="h-14 px-10 rounded-full text-base font-bold bg-[#4f46e5] hover:bg-[#3f38c9] text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                {primaryCtaText}
              </Link>
            )}
            {secondaryCtaText && secondaryCtaLink && (
              <Link
                href={secondaryCtaLink}
                className="h-14 px-10 rounded-full text-base font-bold bg-white text-gray-900 border border-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 mt-16 md:mt-0 flex justify-center relative">
          <div className="relative w-full aspect-square max-w-[500px]">
            {/* Subtle backglow for the illustration */}
            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-50 scale-75"></div>
            {imageUrl && (
              <img
                src={
                  imageUrl.startsWith("http")
                    ? imageUrl
                    : `${AppConstants.DRIVE_ROOT_URL}/${imageUrl}`
                }
                alt="Illustration"
                className="relative z-10 w-full h-full object-contain animate-float"
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroModern;
