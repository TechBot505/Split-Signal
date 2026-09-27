import type { Metadata } from "next";
import { AuthPanel } from "@/components/screens/auth/AuthPanel";

export const metadata: Metadata = { title: "Sign up — Split Signal" };

export default function SignUpPage() {
  return <AuthPanel mode="sign-up" />;
}
