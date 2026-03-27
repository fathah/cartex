"use client";

import React, { useState } from "react";
import { Button, Card, Tag, message } from "antd";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { deleteShippingProfile } from "@/actions/shipping";
import AdminMoney from "@/components/common/AdminMoney";
import { useShipping } from "./ShippingProvider";
import ProfileModal from "./modals/ProfileModal";

export default function ShippingProfiles() {
  const { profiles, refreshProfiles } = useShipping();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  const handleAddProfile = () => {
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteShippingProfile(id);
      message.success("Profile deleted");
      await refreshProfiles();
    } catch {
      message.error("Failed to delete profile");
    }
  };

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Shipping Profiles</h2>
            <p className="text-sm text-gray-500">
              Keep product shipping logic simple. Assign products to profiles
              like Standard, Heavy, Fragile, or Express-only.
            </p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleAddProfile}
          >
            Add Profile
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.name}</span>
                    {profile.isDefault && <Tag color="green">Default</Tag>}
                  </div>
                  <div className="text-xs text-gray-500">{profile.code}</div>
                  {profile.description && (
                    <div className="mt-1 text-sm text-gray-500">
                      {profile.description}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-600">
                    Handling fee:{" "}
                    <AdminMoney value={Number(profile.handlingFee || 0)} />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="text"
                    size="small"
                    icon={<Edit2 size={14} />}
                    onClick={() => handleEditProfile(profile)}
                  />
                  {!profile.isDefault && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteProfile(profile.id)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        editingProfile={editingProfile}
      />
    </>
  );
}
