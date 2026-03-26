"use client";

import React, { useState } from "react";
import {
  List,
  Button,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Typography,
} from "antd";
import { Settings, Layout, Edit, CheckCircle2 } from "lucide-react";
import { SECTIONS, SectionMetadata } from "@/constants/sections";
import { updateSectionConfig } from "@/actions/sections";

const { Text } = Typography;

interface SectionsListProps {
  initialConfigs?: Record<string, any>;
}

const SectionsList: React.FC<SectionsListProps> = ({ initialConfigs = {} }) => {
  const [configs, setConfigs] = useState<Record<string, any>>(initialConfigs);
  const [editingSection, setEditingSection] = useState<SectionMetadata | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = (section: SectionMetadata) => {
    setEditingSection(section);
    const currentConfig =
      configs[section.key] || section.designs[0].defaultConfig;
    form.setFieldsValue({
      designId: currentConfig.id || section.designs[0].id,
      configJson: JSON.stringify(
        currentConfig.configs || currentConfig,
        null,
        2,
      ),
    });
    Modal.confirm({
      title: `Configure ${section.name}`,
      width: 800,
      content: (
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="designId"
            label="Select Design"
            rules={[{ required: true }]}
          >
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={section.designs}
              renderItem={(design) => (
                <List.Item>
                  <Card
                    hoverable
                    size="small"
                    className={`border-2 transition-all ${form.getFieldValue("designId") === design.id ? "border-blue-500 bg-blue-50" : "border-gray-100"}`}
                    onClick={() => {
                      form.setFieldsValue({
                        designId: design.id,
                        configJson: JSON.stringify(
                          design.defaultConfig,
                          null,
                          2,
                        ),
                      });
                    }}
                  >
                    <Card.Meta title={design.name} />
                  </Card>
                </List.Item>
              )}
            />
          </Form.Item>
          <Form.Item
            name="configJson"
            label="Configuration (JSON)"
            rules={[
              { required: true },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch (e) {
                    return Promise.reject("Invalid JSON format");
                  }
                },
              },
            ]}
          >
            <Input.TextArea rows={12} font-family="monospace" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await form.validateFields();
          setLoading(true);
          const finalConfig = {
            id: values.designId,
            configs: JSON.parse(values.configJson),
          };
          const res = await updateSectionConfig(section.key, finalConfig);
          if (res.success) {
            message.success(`${section.name} updated successfully`);
            setConfigs((prev) => ({ ...prev, [section.key]: finalConfig }));
          } else {
            message.error(res.error || "Failed to update");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Global Sections</h2>
        <p className="text-gray-500">
          Manage global components like Navbar and Footer across your entire
          store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECTIONS.map((section) => {
          const isConfigured = !!configs[section.key];
          const currentConfig = configs[section.key];

          return (
            <Card
              key={section.key}
              className="hover:shadow-md transition-shadow border-gray-200"
              actions={[
                <Button
                  type="link"
                  icon={<Edit size={16} />}
                  disabled={section.key === "navbar"}
                  onClick={() => handleEdit(section)}
                  key="edit"
                >
                  {section.key === "navbar" ? "Locked" : "Configure"}
                </Button>,
              ]}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    {section.key === "navbar" ? (
                      <Layout size={24} />
                    ) : (
                      <Settings size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
                {isConfigured ? (
                  <Tag
                    color="success"
                    icon={<CheckCircle2 size={12} className="inline mr-1" />}
                  >
                    Configured
                  </Tag>
                ) : (
                  <Tag>Not Set</Tag>
                )}
              </div>

              {isConfigured && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Active Design:</span>
                    <span className="font-mono text-blue-600 font-semibold text-right">
                      {section.designs.find((d) => d.id === currentConfig.id)
                        ?.name || currentConfig.id}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SectionsList;
