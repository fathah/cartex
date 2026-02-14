"use client";

import React from "react";
import { Card, List, Image, Tag, Typography } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { Media } from "@prisma/client";
import { AppConstants } from "@/constants/constants";

interface MediaListProps {
  data: Media[];
  onSelect?: (media: Media) => void;
  selectedId?: string;
}

const MediaList: React.FC<MediaListProps> = ({
  data,
  onSelect,
  selectedId,
}) => {
  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
      }}
      dataSource={data}
      renderItem={(item) => {
        const isSelected = selectedId === item.id;
        return (
          <List.Item>
            <Card
              hoverable
              onClick={() => onSelect && onSelect(item)}
              className={`${isSelected ? "border-blue-500 ring-2 ring-blue-500" : ""} transition-all duration-200`}
              cover={
                <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                  {item.type === "VIDEO" ? (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <PlayCircleOutlined style={{ fontSize: "2rem" }} />
                      <span className="mt-2 text-xs">Video</span>
                    </div>
                  ) : (
                    <Image
                      alt={item.alt || "Media"}
                      src={`${AppConstants.DRIVE_ROOT_URL}/${item.url}`}
                      className="object-cover w-full h-full"
                      preview={
                        !onSelect
                          ? {
                              // Disable preview mode if in selection mode (onSelect is present)
                              mask: <div className="text-xs">Preview</div>,
                            }
                          : false
                      }
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                      height="100%"
                      width="100%"
                    />
                  )}
                </div>
              }
              bodyStyle={{ padding: "12px" }}
            >
              <Card.Meta
                title={
                  <div className="flex justify-between items-center">
                    <Typography.Text
                      ellipsis={{ tooltip: item.alt || "No description" }}
                      className="text-xs text-gray-500 block"
                    >
                      {item.alt || "No description"}
                    </Typography.Text>
                    <Tag color={item.type === "VIDEO" ? "blue" : "green"}>
                      {item.type}
                    </Tag>
                  </div>
                }
              />
            </Card>
          </List.Item>
        );
      }}
    />
  );
};

export default MediaList;
