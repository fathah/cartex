"use client";

import React from "react";
import { Form, Input, Select, Button } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import MediaPicker from "../../../media/media_picker";

const TestimonialFields = ({ form }: { form: any }) => {
  return (
    <>
      <Form.Item name="title" label="Section Title">
        <Input placeholder="What our customers say" />
      </Form.Item>
      <Form.Item name="subtitle" label="Subtitle">
        <Input.TextArea placeholder="A brief description for the testimonials section" />
      </Form.Item>
      <Form.List name="testimonials">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                className="border p-4 rounded-lg mb-4 relative bg-gray-50"
              >
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  label="Customer Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "role"]}
                  label="Role / Title"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "content"]}
                  label="Testimonial"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "avatar"]}
                  label="Avatar"
                >
                  <Input
                    placeholder="/path/to/avatar.jpg"
                    addonAfter={
                      <MediaPicker
                        onSelect={(m: any) => {
                          const testimonials =
                            form.getFieldValue("testimonials");
                          testimonials[name].avatar = m.url;
                          form.setFieldsValue({ testimonials });
                        }}
                        trigger={<PictureOutlined />}
                      />
                    }
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "rating"]}
                  label="Rating"
                  initialValue={5}
                >
                  <Select>
                    <Select.Option value={1}>1</Select.Option>
                    <Select.Option value={2}>2</Select.Option>
                    <Select.Option value={3}>3</Select.Option>
                    <Select.Option value={4}>4</Select.Option>
                    <Select.Option value={5}>5</Select.Option>
                  </Select>
                </Form.Item>
                <Button
                  type="text"
                  danger
                  onClick={() => remove(name)}
                  className="absolute top-2 right-2"
                  icon={<MinusCircleOutlined />}
                />
              </div>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Testimonial
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
};

export default TestimonialFields;
