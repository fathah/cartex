import React from "react";
import { Form, ColorPicker } from "antd";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const TextFields = () => {
  return (
    <>
      <Form.Item
        name="backgroundColor"
        label="Background Color"
        getValueFromEvent={(color) => color.toHexString()}
      >
        <ColorPicker showText />
      </Form.Item>
      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true }]}
        help="Full Markdown Editor support"
      >
        <EditorWrapper />
      </Form.Item>
    </>
  );
};

const EditorWrapper = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (val?: string) => void;
}) => {
  return (
    <div data-color-mode="light">
      <MDEditor value={value} onChange={onChange} height={500} />
    </div>
  );
};

export default TextFields;
