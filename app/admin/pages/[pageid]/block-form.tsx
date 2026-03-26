"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import { getCollections } from "@/actions/collection";
import { getProducts } from "@/actions/product";

import HeroFields from "./block-fields/HeroFields";
import HeroModernFields from "./block-fields/HeroModernFields";
import TextFields from "./block-fields/TextFields";
import ProductFields from "./block-fields/ProductFields";
import CollectionFields from "./block-fields/CollectionFields";
import TestimonialFields from "./block-fields/TestimonialFields";
import CarouselFields from "./block-fields/CarouselFields";
import { getBlockDefinition } from "@/lib/pageblocks/registry";

interface BlockFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (config: Record<string, unknown>) => void;
  initialConfig?: Record<string, unknown>;
  blockType: string;
}

interface CollectionOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
}

const BlockFormModal: React.FC<BlockFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialConfig,
  blockType,
}) => {
  const [form] = Form.useForm();
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);

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

  const onFinish = (values: Record<string, unknown>) => {
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
      case "COLLECTIONS_GRID":
      case "COLLECTIONS_SPOTLIGHT":
      case "COLLECTIONS_RAIL":
        return (
          <CollectionFields collections={collections} blockType={blockType} />
        );
      case "TESTIMONIALS":
        return <TestimonialFields form={form} />;
      case "CAROUSEL_1_3":
      case "CAROUSEL_1_2":
      case "CAROUSEL_FULL":
        return <CarouselFields form={form} />;
      default:
        return <div>Unknown Block Type</div>;
    }
  };

  const definition = getBlockDefinition(blockType);
  const modalTitle = `${initialConfig ? "Edit" : "Configure"} ${
    definition?.label || blockType
  }`;

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      onOk={form.submit}
      width={
        blockType === "TEXT"
          ? "80%"
          : blockType.startsWith("COLLECTIONS_")
            ? 860
            : 700
      }
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {renderFields()}
      </Form>
    </Modal>
  );
};

export default BlockFormModal;
