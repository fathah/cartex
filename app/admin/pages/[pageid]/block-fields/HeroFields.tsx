"use client";

import React from "react";
import { Form, Input } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import MediaPicker from "../../../media/media_picker";
import { AppConstants } from "@/constants/constants";

const HeroFields = ({ form }: { form: any }) => {
  return (
    <>
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="subtitle" label="Subtitle">
        <Input />
      </Form.Item>
      <Form.Item name="ctaText" label="CTA Text">
        <Input />
      </Form.Item>
      <Form.Item name="ctaLink" label="CTA Link">
        <Input />
      </Form.Item>
      <Form.Item
        name="imageUrl"
        label="Background Image"
        rules={[{ required: true }]}
      >
        <Input
          placeholder="Image URL"
          addonAfter={
            <MediaPicker
              onSelect={(m: any) => form.setFieldsValue({ imageUrl: m.url })}
              trigger={<PictureOutlined className="cursor-pointer" />}
            />
          }
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.imageUrl !== curr.imageUrl}
      >
        {({ getFieldValue }) => {
          const url = getFieldValue("imageUrl");
          return url ? (
            <div className="mt-2 text-center">
              <img
                src={`${AppConstants.DRIVE_ROOT_URL}/${url}`}
                alt="Preview"
                className="max-h-32 mx-auto rounded border"
              />
            </div>
          ) : null;
        }}
      </Form.Item>
    </>
  );
};

export default HeroFields;
