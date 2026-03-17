"use client";

import React, { useState } from "react";
import PageRenderer from "@/components/page-renderer";
import { PageBlock } from "@prisma/client";
import { Segmented } from "antd";
import {
  Monitor,
  Layout,
  Type,
  ShoppingBag,
  MessageSquare,
  Image as ImageIcon,
  MousePointer2,
} from "lucide-react";
import { getBlockDefinition } from "@/lib/pageblocks/registry";
import { PUBLIC_ENV } from "@/constants/env_public";

interface PagePreviewProps {
  blocks: PageBlock[];
}

const StaticBlock = ({ block }: { block: PageBlock }) => {
  const definition = getBlockDefinition(block.blockType);

  const getIcon = () => {
    switch (definition?.category) {
      case "Hero":
        return <Layout size={20} className="text-blue-500" />;
      case "Products":
        return <ShoppingBag size={20} className="text-emerald-500" />;
      case "Content":
        return <Type size={20} className="text-amber-500" />;
      case "Social":
        return <MessageSquare size={20} className="text-purple-500" />;
      case "Media":
        return <ImageIcon size={20} className="text-pink-500" />;
      default:
        return <MousePointer2 size={20} className="text-gray-500" />;
    }
  };

  const config = block.config as any;
  const summary = [
    config.title || config.name || config.content?.substring(0, 30),
    config.sourceType ? `Source: ${config.sourceType}` : null,
    config.backgroundColor ? `BG: ${config.backgroundColor}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 group hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 min-h-[140px]">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
        {getIcon()}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-gray-900 text-sm">
          {definition?.label || block.blockType}
        </h3>
        {summary && (
          <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[200px]">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};

const PagePreview: React.FC<PagePreviewProps> = ({ blocks }) => {
  const [mode, setMode] = useState<"static" | "live">("static");

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-full mb-10">
      <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b gap-4">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>

        <Segmented
          value={mode}
          onChange={(v) => setMode(v as any)}
          options={[
            {
              label: (
                <div className="flex items-center gap-2 px-2">
                  <Layout size={14} />
                  <span>Wireframe</span>
                </div>
              ),
              value: "static",
            },
            {
              label: (
                <div className="flex items-center gap-2 px-2">
                  <Monitor size={14} />
                  <span>Live</span>
                </div>
              ),
              value: "live",
            },
          ]}
          size="small"
          className="bg-gray-200/50 p-0.5 rounded-lg"
        />

        <div className="flex-1 bg-white rounded py-1 px-3 text-[10px] text-gray-400 text-center truncate font-mono">
          {PUBLIC_ENV.BASE_URL}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-6">
        {mode === "live" ? (
          <div className="transform scale-[0.85] origin-top h-full pb-20">
            <PageRenderer blocks={blocks} />
          </div>
        ) : (
          <div className="space-y-4 pb-20 max-w-2xl mx-auto">
            {blocks.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-gray-300 gap-2 border-2 border-dashed rounded-2xl">
                <Layout size={40} strokeWidth={1} />
                <p className="text-xs">No blocks added yet</p>
              </div>
            ) : (
              blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => <StaticBlock key={block.id} block={block} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PagePreview;
