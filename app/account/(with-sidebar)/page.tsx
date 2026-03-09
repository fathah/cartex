"use client";

import ProfileForm from "../comps/ProfileForm";
import { useUser } from "../comps/UserContext";

export default function AccountPage() {
  const { user } = useUser();

  return <ProfileForm user={user} />;
}
