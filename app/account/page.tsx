"use client";

import ProfileForm from "./ProfileForm";
import { useUser } from "./UserContext";

export default function AccountPage() {
  const { user } = useUser();

  return <ProfileForm user={user} />;
}
