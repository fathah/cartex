import React from "react";
import { getPage } from "@/actions/app_page_blocks";
import BlockList from "./block-list";
import { notFound } from "next/navigation";
import { Button } from "antd";
import { Settings } from "lucide-react";
import Link from "next/link";

interface PageEditProps {
  params: Promise<{ pageid: string }>;
}

const PageEdit = async ({ params }: PageEditProps) => {
  const { pageid } = await params;
  const page = await getPage(pageid);

  if (!page) {
    return notFound();
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center z-10 shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold">{page.name}</h1>
          <p className="text-xs text-gray-500">/{page.slug}</p>
        </div>
      </div>

      <BlockList pageId={page.id} blocks={page.blocks} />
    </div>
  );
};

export default PageEdit;
