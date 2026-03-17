"use client";

import React from "react";
import { Form, Input, Button, Card, Switch, ColorPicker } from "antd";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import MediaPicker from "../../../media/media_picker";
import { AppConstants } from "@/constants/constants";

const CarouselFields = ({ form }: { form: any }) => {
  return (
    <>
      <Form.Item
        name="hasPadding"
        label="With Padding"
        valuePropName="checked"
        initialValue={false}
      >
        <Switch />
      </Form.Item>
      <Form.Item
        name="backgroundColor"
        label="Background Color"
        getValueFromEvent={(color) => color.toHexString()}
      >
        <ColorPicker showText />
      </Form.Item>
      <Form.List name="slides">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-4">
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                title={`Slide ${name + 1}`}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => remove(name)}
                  />
                }
                className="bg-gray-50 border-gray-200"
              >
                <Form.Item
                  {...restField}
                  name={[name, "image"]}
                  label="Image"
                  rules={[{ required: true, message: "Missing image" }]}
                >
                  <Input
                    placeholder="Image URL"
                    addonAfter={
                      <MediaPicker
                        onSelect={(m: any) => {
                          const slides = form.getFieldValue("slides") || [];
                          const newSlides = [...slides];
                          newSlides[name] = {
                            ...newSlides[name],
                            image: m.url,
                          };
                          form.setFieldsValue({ slides: newSlides });
                        }}
                        trigger={
                          <ImageIcon size={16} className="cursor-pointer" />
                        }
                      />
                    }
                  />
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev.slides?.[name]?.image !== curr.slides?.[name]?.image
                  }
                >
                  {({ getFieldValue }) => {
                    const url = getFieldValue(["slides", name, "image"]);
                    return url ? (
                      <div className="mb-4 text-center">
                        <img
                          src={`${AppConstants.DRIVE_ROOT_URL}/${url}`}
                          alt="Preview"
                          className="max-h-24 mx-auto rounded border"
                        />
                      </div>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, "link"]}
                  label="Link URL"
                >
                  <Input placeholder="e.g. /products/luxury-perfume" />
                </Form.Item>
              </Card>
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<Plus size={16} />}
              className="h-12 flex items-center justify-center"
            >
              Add Slide
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
};

export default CarouselFields;
