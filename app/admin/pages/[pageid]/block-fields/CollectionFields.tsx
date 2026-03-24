"use client";

import React from "react";
import {
  Alert,
  Card,
  Col,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";

interface CollectionFieldsProps {
  collections: Array<{ id: string; name: string }>;
  blockType: string;
}

const collectionBlockNotes: Record<
  string,
  { title: string; description: string; defaultLimit: number }
> = {
  COLLECTIONS_GRID: {
    title: "Collections Grid",
    description:
      "Balanced collection cards for landing pages, seasonal edits, and catalog highlights.",
    defaultLimit: 6,
  },
  COLLECTIONS_SPOTLIGHT: {
    title: "Collections Spotlight",
    description:
      "One featured collection with supporting cards. Works best with 3 to 4 collections.",
    defaultLimit: 4,
  },
  COLLECTIONS_RAIL: {
    title: "Collections Rail",
    description:
      "Horizontal scrolling collection cards that feel fast and editorial.",
    defaultLimit: 8,
  },
};

const CollectionFields: React.FC<CollectionFieldsProps> = ({
  collections,
  blockType,
}) => {
  const note =
    collectionBlockNotes[blockType] || collectionBlockNotes.COLLECTIONS_GRID;

  return (
    <div className="space-y-5">
      <Alert
        type="info"
        showIcon
        message={note.title}
        description={note.description}
      />

      <Card size="small" title="Content">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="title" label="Title">
              <Input placeholder="e.g. Explore the collection" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="ctaLabel" label="CTA Label" initialValue="View collection">
              <Input placeholder="e.g. Shop the edit" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="subtitle" label="Subtitle">
          <Input.TextArea
            rows={3}
            placeholder="Short supporting copy for the section introduction."
          />
        </Form.Item>
      </Card>

      <Card size="small" title="Source">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="sourceType"
              label="Collection Source"
              initialValue="LATEST"
              rules={[{ required: true, message: "Choose a source" }]}
            >
              <Select
                options={[
                  { label: "Latest Collections", value: "LATEST" },
                  { label: "Custom Selection", value: "CUSTOM" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="limit"
              label="Items to Show"
              initialValue={note.defaultLimit}
              help="Keep spotlight layouts tighter for the cleanest result."
            >
              <InputNumber className="w-full" min={1} max={12} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.sourceType !== curr.sourceType}
        >
          {({ getFieldValue }) =>
            getFieldValue("sourceType") === "CUSTOM" ? (
              <Form.Item
                name="collectionIds"
                label="Selected Collections"
                rules={[
                  {
                    required: true,
                    message: "Choose at least one collection",
                  },
                ]}
                extra="The selected order is used on the storefront."
              >
                <Select
                  mode="multiple"
                  placeholder="Choose collections"
                  optionFilterProp="label"
                  showSearch
                  maxTagCount="responsive"
                  options={collections.map((collection) => ({
                    label: collection.name,
                    value: collection.id,
                  }))}
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Card>

      <Card size="small" title="Style">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="alignment" label="Heading Alignment" initialValue="left">
              <Select
                options={[
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="backgroundColor"
              label="Background Color"
              getValueFromEvent={(color) => color?.toHexString?.()}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="accentColor"
              label="Accent Color"
              initialValue="#7c3aed"
              getValueFromEvent={(color) => color?.toHexString?.()}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="showDescription"
              label="Show Description"
              valuePropName="checked"
              initialValue
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="showProductCount"
              label="Show Product Count"
              valuePropName="checked"
              initialValue
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Text type="secondary">
          Background and accent colors apply to chips, links, and section tone.
        </Typography.Text>
      </Card>
    </div>
  );
};

export default CollectionFields;
