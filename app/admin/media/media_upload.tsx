"use client";

import React, { useState } from "react";
import { Button, Modal, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { generateSignedUrl } from "@/services/zdrive";
import { uploadFile } from "@/services/zdrive-client";
import { createMedia } from "@/actions/media";

interface MediaUploadProps {
  onCustomSuccess?: (media: any) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onCustomSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // 1. Get Signed URL
      const signedUpload = await generateSignedUrl({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      // 2. Upload to Object Storage
      const uploadRes = await uploadFile(file, signedUpload.signedUrl);
      if (!uploadRes.success || !uploadRes.filename)
        throw new Error("Upload to ZDrive failed");

      // 3. Create Record in DB
      // Determine type based on file type (basic check)
      const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

      const res = await createMedia(signedUpload.filename, type, file.name);

      if (res.success) {
        onSuccess("ok");
        message.success("Uploaded successfully");
        setIsModalOpen(false);
        if (onCustomSuccess) {
          onCustomSuccess(res.data);
        }
      } else {
        throw new Error(res.error || "Failed to save media record");
      }
    } catch (err) {
      console.error(err);
      onError(new Error("Upload failed"));
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Upload Media
      </Button>
      <Modal
        title="Upload Media"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Upload.Dragger
          customRequest={handleUpload}
          multiple={false} // Simplification for now, can support multiple later
          listType="picture"
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single image or video upload.
          </p>
        </Upload.Dragger>
      </Modal>
    </>
  );
};

export default MediaUpload;
