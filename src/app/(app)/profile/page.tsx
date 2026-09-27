import type { Metadata } from "next";
import { ProfileScreen } from "@/components/screens/profile/ProfileScreen";

export const metadata: Metadata = { title: "Profile — Split Signal" };

export default function ProfilePage() {
  return <ProfileScreen />;
}
