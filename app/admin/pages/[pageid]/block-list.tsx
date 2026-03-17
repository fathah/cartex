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
import { getGroupedBlockTypes } from "@/lib/pageblocks/registry";
import BlockPickerModal from "./block-picker";
import PagePreview from "./page-preview";
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

const BlockList: React.FC<BlockListProps> = ({
  pageId,
  blocks: initialBlocks,
}) => {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

        reorderBlocks(
          pageId,
          newItems.map((item) => item.id),
        ).catch(() => {
          message.error("Failed to save order");
          setBlocks(items);
        });

        return newItems;
      });
    }
  };

  const handleAddClick = () => {
    setIsPickerOpen(true);
  };

  const handleTypeSelect = (type: string) => {
    setEditingBlock(null);
    setSelectedType(type);
    setIsPickerOpen(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (block: PageBlock) => {
    setEditingBlock(block);
    setSelectedType(block.blockType);
    setIsFormOpen(true);
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
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Operation failed");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      {/* Sidebar - 30% */}
      <div className="w-[30%] min-w-[350px] flex flex-col border-r bg-white">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Blocks</h2>
              <p className="text-gray-500 text-xs">Manage your page content</p>
            </div>
            <Button
              type="primary"
              shape="circle"
              icon={<Plus size={18} />}
              onClick={handleAddClick}
              className="flex items-center justify-center"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {blocks.length === 0 && (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Plus className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-gray-400 text-xs">
                No blocks yet. Add a block to get started.
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
      </div>

      {/* Preview - 70% */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50">
        <div className="max-w-5xl mx-auto h-full">
          <PagePreview blocks={blocks} />
        </div>
      </div>

      <BlockPickerModal
        open={isPickerOpen}
        onCancel={() => setIsPickerOpen(false)}
        onSelect={handleTypeSelect}
      />

      <BlockFormModal
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialConfig={editingBlock?.config}
        blockType={selectedType}
      />
    </div>
  );
};

export default BlockList;
