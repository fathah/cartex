"use client";

import { Form, Input, Radio, Button, Select } from "antd";
import { Plus, MapPin } from "lucide-react";
import { useState } from "react";
import AddressModal from "@/components/AddressModal";

interface DeliveryAddressProps {
  customer: any;
  addresses: any[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
}

export default function DeliveryAddress({
  customer,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
}: DeliveryAddressProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-6">Delivery Information</h2>

      {/* Logged in with Addresses */}
      {customer ? (
        <div>
          <Radio.Group
            className="w-full"
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Existing Addresses */}
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`
                    border rounded-xl p-4 cursor-pointer hover:border-[#003d29] transition-colors
                    ${selectedAddressId === addr.id ? "border-[#003d29] bg-green-50/30" : "border-gray-200"}
                  `}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <Radio value={addr.id} className="w-full">
                    <div className="flex items-start gap-3 w-full pl-2">
                      <MapPin
                        size={18}
                        className="mt-1 text-gray-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{addr.fullname}</span>
                          <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                            {addr.addressType || "HOME"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {addr.address1}
                          {addr.address2 && `, ${addr.address2}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {addr.city}, {addr.zip}, {addr.country}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {addr.phone}
                        </div>
                      </div>
                    </div>
                  </Radio>
                </div>
              ))}

              {/* Add New Address Card */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-600 hover:border-[#003d29] hover:text-[#003d29] hover:bg-green-50/20 transition-colors min-h-[100px]"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Plus size={24} />
                </div>
                <span className="font-medium">Add New Address</span>
              </button>
            </div>
          </Radio.Group>

          <AddressModal
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            onSuccess={() => setModalOpen(false)}
          />
        </div>
      ) : (
        // Guest Form
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label="Name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                size="large"
                placeholder="Zaid Omer"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="zaid@ziqx.cc"
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="Phone number"
              rules={[
                { required: true, message: "Please enter your phone number" },
              ]}
            >
              <Input
                size="large"
                addonBefore={
                  <Select
                    defaultValue="+1"
                    style={{ width: 80 }}
                    className="select-before"
                  >
                    <Select.Option value="+1">🇺🇸 +1</Select.Option>
                    <Select.Option value="+44">🇬🇧 +44</Select.Option>
                    <Select.Option value="+62">🇮🇩 +62</Select.Option>
                  </Select>
                }
                placeholder="888 999 1222"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="addressType"
              label="Address Type"
              rules={[{ required: true }]}
              initialValue="HOME"
            >
              <Select size="large" className="w-full">
                <Select.Option value="HOME">Home</Select.Option>
                <Select.Option value="WORK">Work</Select.Option>
                <Select.Option value="OTHER">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="address" label="Address" className="mb-0">
            <Input.TextArea
              rows={3}
              placeholder="123 Main St, Appt 4B"
              className="rounded-lg"
            />
          </Form.Item>
        </>
      )}
    </section>
  );
}
