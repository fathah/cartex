import React from "react";
import { getPage } from "@/app/actions/page-blocks";
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
    <div>
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold">{page.name}</h1>
          <p className="text-xs text-gray-500">/{page.slug}</p>
        </div>

        {/* Note: In a real app we might open the PageFormModal here. 
                For now simplifying to just view, assuming editing properties is done on the list page 
                or we can direct link back if needed.
             */}
      </div>

      <div className="min-h-screen bg-gray-50">
        <BlockList pageId={page.id} blocks={page.blocks} />
      </div>
    </div>
  );
};

export default PageEdit;
