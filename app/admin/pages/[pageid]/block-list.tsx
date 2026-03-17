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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Page Content</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and reorder your page blocks
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<Plus size={18} />}
          onClick={handleAddClick}
          className="h-12 px-6 rounded-xl font-semibold shadow-lg shadow-blue-100 flex items-center"
        >
          Add Block
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="max-w-xs mx-auto">
              <Plus className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">
                No content blocks yet. Click the "Add Block" button to start
                building your page.
              </p>
            </div>
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
