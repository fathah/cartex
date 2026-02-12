"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Button, Space, Popconfirm } from "antd";
import { Trash2, Edit, GripVertical } from "lucide-react";

interface SortableBlockProps {
  id: string;
  block: any;
  onEdit: (block: any) => void;
  onDelete: (id: string) => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({
  id,
  block,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: "16px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        title={
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
            </div>
            <span className="font-medium text-gray-700">{block.blockType}</span>
          </div>
        }
        extra={
          <Space>
            <Button
              type="text"
              icon={<Edit size={14} />}
              onClick={() => onEdit(block)}
            />
            <Popconfirm
              title="Delete block?"
              onConfirm={() => onDelete(block.id)}
              placement="left" // Better placement
            >
              <Button type="text" danger icon={<Trash2 size={14} />} />
            </Popconfirm>
          </Space>
        }
        className="shadow-sm border-gray-200"
      >
        <div className="text-sm text-gray-600 truncate">
          {block.blockType === "TEXT" && (block.config as any).content}
          {block.blockType === "HERO" && (block.config as any).title}
          {block.blockType === "IMAGE_GRID" && "Image Grid Component"}
        </div>
      </Card>
    </div>
  );
};

export default SortableBlock;
