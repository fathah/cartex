import React from "react";
import prisma from "@/db/prisma";
import { notFound } from "next/navigation";
import PageRenderer from "@/components/page-renderer";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pageSlug = slug.join("/");

  const page = await prisma.page.findUnique({
    where: { slug: pageSlug, isPublished: true },
  });

  if (!page) return {};

  return {
    title: page.name,
    // Add SEO description if available in schema later
  };
}

const DynamicPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const pageSlug = slug.join("/");

  const page = await prisma.page.findUnique({
    where: { slug: pageSlug, isPublished: true },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    return notFound();
  }

  return (
    <>
      <Header />
      <PageRenderer blocks={page.blocks as any} />
      <Footer />
    </>
  );
};

export default DynamicPage;
