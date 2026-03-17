"use client";

import React from "react";
import { Form, Input, ColorPicker } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import MediaPicker from "../../../media/media_picker";
import { AppConstants } from "@/constants/constants";

const HeroModernFields = ({ form }: { form: any }) => {
  return (
    <>
      <Form.Item name="title" label="Main Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="primaryCtaText" label="Primary Button Text">
          <Input />
        </Form.Item>
        <Form.Item name="primaryCtaLink" label="Primary Button Link">
          <Input />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="secondaryCtaText" label="Secondary Button Text">
          <Input />
        </Form.Item>
        <Form.Item name="secondaryCtaLink" label="Secondary Button Link">
          <Input />
        </Form.Item>
      </div>
      <Form.Item
        name="backgroundColor"
        label="Background Color"
        getValueFromEvent={(color) => color.toHexString()}
      >
        <ColorPicker showText />
      </Form.Item>
      <Form.Item
        name="imageUrl"
        label="Illustration"
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

export default HeroModernFields;
