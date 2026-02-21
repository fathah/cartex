"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Tabs, Spin } from "antd";
import { Media } from "@prisma/client";
import { getMedia } from "@/actions/media";
import MediaList from "./media_list";
import MediaUpload from "./media_upload";
import { Image } from "lucide-react";

interface MediaPickerProps {
  onSelect: (media: Media) => void;
  trigger?: React.ReactNode;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onSelect, trigger }) => {
  const [open, setOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("library");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const items = await getMedia();
      setMediaItems(items);
    } catch (error) {
      console.error("Failed to fetch media", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && activeTab === "library") {
      fetchMedia();
    }
  }, [open, activeTab]);

  const handleSelect = (media: Media) => {
    setSelectedId(media.id);
    onSelect(media);
    setOpen(false); // Auto close on select? Or require confirm?
    // Usually picker closes on select for simplicty unless multi-select.
  };

  const handleUploadSuccess = (media: any) => {
    // Refresh list and switch tab
    fetchMedia();
    setActiveTab("library");
    // Optionally auto-select the new one
    handleSelect(media);
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="inline-block cursor-pointer"
      >
        {trigger || <Button icon={<Image size={16} />}>Select Image</Button>}
      </div>

      <Modal
        title="Media Library"
        open={open}
        onCancel={() => setOpen(false)}
        width={1000}
        footer={null} // No footer needed as selection closes or buttons insideTabs do actions
        bodyStyle={{ height: "70vh", overflow: "auto", padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ padding: "0 24px" }}
          items={[
            {
              key: "library",
              label: "Library",
              children: (
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <Spin />
                    </div>
                  ) : (
                    <MediaList
                      data={mediaItems}
                      onSelect={handleSelect}
                      selectedId={selectedId}
                    />
                  )}
                </div>
              ),
            },
            {
              key: "upload",
              label: "Upload",
              children: (
                <div className="p-6 flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 m-6 rounded-lg bg-gray-50">
                  <div className="text-center">
                    <p className="mb-4 text-gray-500">
                      Upload new media files to your library
                    </p>
                    <MediaUpload onCustomSuccess={handleUploadSuccess} />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default MediaPicker;
