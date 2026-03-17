"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import { getCollections } from "@/actions/collection";
import { getProducts } from "@/actions/product";

import HeroFields from "./block-fields/HeroFields";
import HeroModernFields from "./block-fields/HeroModernFields";
import TextFields from "./block-fields/TextFields";
import ProductFields from "./block-fields/ProductFields";
import TestimonialFields from "./block-fields/TestimonialFields";

interface BlockFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (config: any) => void;
  initialConfig?: any;
  blockType: string;
}

const BlockFormModal: React.FC<BlockFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialConfig,
  blockType,
}) => {
  const [form] = Form.useForm();
  const [collections, setCollections] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [cols, { products }] = await Promise.all([
        getCollections(),
        getProducts(1, 1000),
      ]);
      setCollections(cols);
      setAllProducts(products);
    };
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialConfig) {
        form.setFieldsValue(initialConfig);
      }
    }
  }, [open, initialConfig, form]);

  const onFinish = (values: any) => {
    onSuccess(values);
  };

  const renderFields = () => {
    switch (blockType) {
      case "HERO":
        return <HeroFields form={form} />;
      case "HERO_MODERN":
        return <HeroModernFields form={form} />;
      case "TEXT":
        return <TextFields />;
      case "PRODUCTS_GRID":
      case "PRODUCTS_SLIDER":
        return (
          <ProductFields collections={collections} allProducts={allProducts} />
        );
      case "TESTIMONIALS":
        return <TestimonialFields form={form} />;
      default:
        return <div>Unknown Block Type</div>;
    }
  };

  return (
    <Modal
      title={`Edit ${blockType} Block`}
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {renderFields()}
      </Form>
    </Modal>
  );
};

export default BlockFormModal;
