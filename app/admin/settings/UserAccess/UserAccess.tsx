"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Card,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { UserRole } from "@prisma/client";
import { getAdminUsers, addAdminUser, removeAdminUser } from "@/actions/users";

const UserAccess = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await addAdminUser(
        values.email,
        values.role,
        values.firstName,
        values.lastName,
      );
      if (res.success) {
        message.success("User added successfully");
        setIsModalVisible(false);
        form.resetFields();
        fetchUsers();
      } else {
        message.error(res.error || "Failed to add user");
      }
    } catch (error) {
      message.error("Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const res = await removeAdminUser(userId);
      if (res.success) {
        message.success("User access removed");
        fetchUsers();
      } else {
        message.error("Failed to remove user");
      }
    } catch (error) {
      // message.error("Failed to remove user");
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">
            {record.firstName} {record.lastName}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "blue";
        if (role === "SUPER_ADMIN") color = "gold";
        if (role === "ADMIN") color = "green";
        return <Tag color={color}>{role.replace("_", " ")}</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => (
        <Tag color={record.ziqxId ? "success" : "warning"}>
          {record.ziqxId ? "Active" : "Invited"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.role !== "SUPER_ADMIN" && (
            <Popconfirm
              title="Remove access"
              description="Are you sure you want to remove this user's access?"
              onConfirm={() => handleRemoveUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="User Access Management"
      extra={
        <div className="space-x-2">
          <Tooltip title="Refresh List">
            <Button icon={<ReloadOutlined />} onClick={fetchUsers} />
          </Tooltip>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add User
          </Button>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Add New User"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
            initialValue="ADMIN"
          >
            <Select>
              <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="STAFF">Staff</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="John" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name">
              <Input placeholder="Doe" />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserAccess;
