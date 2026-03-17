"use client";

import React from "react";
import { Form, Input } from "antd";

const TextFields = () => {
  return (
    <Form.Item
      name="content"
      label="Content"
      rules={[{ required: true }]}
      help="Markdown or HTML supported"
    >
      <Input.TextArea rows={10} />
    </Form.Item>
  );
};

export default TextFields;
