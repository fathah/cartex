"use client";

import React from "react";
import { Button } from "antd";
import Link from "next/link";
import { AppConstants } from "@/constants/constants";

interface HeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageUrl,
}) => {
  return (
    <section className="relative h-[600px] flex items-center justify-center text-white text-center bg-gray-900 overflow-hidden">
      {imageUrl && (
        <img
          src={
            imageUrl.startsWith("http")
              ? imageUrl
              : `${AppConstants.DRIVE_ROOT_URL}/${imageUrl}`
          }
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}
      <div className="relative z-10 max-w-4xl px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl mb-10 text-gray-200">{subtitle}</p>
        )}
        {ctaText && ctaLink && (
          <Link href={ctaLink}>
            <Button
              size="large"
              type="primary"
              className="h-14 px-10 text-lg rounded-full font-semibold"
            >
              {ctaText}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default Hero;
