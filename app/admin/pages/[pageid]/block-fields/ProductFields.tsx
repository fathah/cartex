"use client";

import React from "react";
import { Form, Input, Select, InputNumber } from "antd";

interface ProductFieldsProps {
  collections: any[];
  allProducts: any[];
}

const ProductFields: React.FC<ProductFieldsProps> = ({
  collections,
  allProducts,
}) => {
  return (
    <>
      <Form.Item name="title" label="Title">
        <Input placeholder="e.g. New Arrivals" />
      </Form.Item>
      <Form.Item name="subtitle" label="Subtitle">
        <Input placeholder="e.g. Explore our latest collection of premium fragrances" />
      </Form.Item>
      <Form.Item name="alignment" label="Alignment" initialValue="left">
        <Select>
          <Select.Option value="left">Left</Select.Option>
          <Select.Option value="center">Center</Select.Option>
          <Select.Option value="right">Right</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="sourceType"
        label="Product Source"
        initialValue="COLLECTION"
        rules={[{ required: true }]}
      >
        <Select>
          <Select.Option value="COLLECTION">By Collection</Select.Option>
          <Select.Option value="LATEST">Latest Products</Select.Option>
          <Select.Option value="OFFER">Offer Products (On Sale)</Select.Option>
          <Select.Option value="CUSTOM">Custom Selection</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.sourceType !== curr.sourceType}
      >
        {({ getFieldValue }) => {
          const sourceType = getFieldValue("sourceType");
          if (sourceType === "COLLECTION") {
            return (
              <Form.Item
                name="collectionId"
                label="Select Collection"
                rules={[{ required: true }]}
              >
                <Select placeholder="Choose a collection">
                  {collections.map((c: any) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }
          if (sourceType === "CUSTOM") {
            return (
              <Form.Item
                name="productIds"
                label="Select Products"
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Choose products"
                  optionFilterProp="children"
                  showSearch
                >
                  {allProducts.map((p: any) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }
          return null;
        }}
      </Form.Item>

      <Form.Item
        name="limit"
        label="Limit"
        initialValue={8}
        help="Number of products to show"
      >
        <InputNumber className="w-full" min={1} max={50} />
      </Form.Item>
    </>
  );
};

export default ProductFields;
