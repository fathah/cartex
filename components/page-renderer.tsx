import React from "react";
import { getBlockDefinition } from "@/lib/pageblocks/registry";

interface PageBlock {
  id: string;
  blockType: string;
  config: any;
  order: number;
}

interface PageRendererProps {
  blocks: PageBlock[];
}

const PageRenderer: React.FC<PageRendererProps> = ({ blocks }) => {
  return (
    <main>
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const definition = getBlockDefinition(block.blockType);
          if (!definition) {
            console.warn(`Unknown block type: ${block.blockType}`);
            return null;
          }

          const Component = definition.component;
          return <Component key={block.id} {...block.config} />;
        })}
    </main>
  );
};

export default PageRenderer;
