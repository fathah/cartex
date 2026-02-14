"use client";

import React, { useState, useEffect } from "react";
import { Button, Dropdown, message } from "antd";
import { Plus } from "lucide-react";
import { Page, PageBlock } from "@prisma/client";
import {
  addBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from "@/actions/app_page_blocks";
import BlockFormModal from "./block-form";
import SortableBlock from "./sortable-block";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface BlockListProps {
  pageId: string;
  blocks: PageBlock[];
}

const BLOCK_TYPES = [
  { key: "HERO", label: "Hero Section" },
  { key: "TEXT", label: "Text Content" },
  { key: "IMAGE_GRID", label: "Image Grid" },
];

const BlockList: React.FC<BlockListProps> = ({
  pageId,
  blocks: initialBlocks,
}) => {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [selectedType, setSelectedType] = useState<string>("TEXT");

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Optimistic update
        reorderBlocks(
          pageId,
          newItems.map((item) => item.id),
        ).catch(() => {
          message.error("Failed to save order");
          setBlocks(items); // Revert
        });

        return newItems;
      });
    }
  };

  const handleAddClick = (type: string) => {
    setEditingBlock(null);
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleEditClick = (block: PageBlock) => {
    setEditingBlock(block);
    setSelectedType(block.blockType);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteBlock(id);
      if (res.success) {
        message.success("Block deleted");
      } else {
        message.error("Failed to delete block");
      }
    } catch (e) {
      console.error(e);
      message.error("Error deleting block");
    }
  };

  const handleFormSuccess = async (config: any) => {
    try {
      if (editingBlock) {
        const res = await updateBlock(editingBlock.id, config);
        if (res.success) {
          message.success("Block updated");
        }
      } else {
        const res = await addBlock(pageId, selectedType, config);
        if (res.success) {
          message.success("Block added");
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Operation failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Page Content</h2>
        <Dropdown
          menu={{
            items: BLOCK_TYPES.map((t) => ({
              key: t.key,
              label: t.label,
              onClick: () => handleAddClick(t.key),
            })),
          }}
        >
          <Button type="primary" icon={<Plus size={16} />}>
            Add Block
          </Button>
        </Dropdown>
      </div>

      <div className="space-y-4">
        {blocks.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">
              No content blocks yet. Add one to get started.
            </p>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                block={block}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <BlockFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialConfig={editingBlock?.config}
        blockType={selectedType}
      />
    </div>
  );
};

export default BlockList;
