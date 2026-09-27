import type { Metadata } from "next";
import { AuthPanel } from "@/components/screens/auth/AuthPanel";

export const metadata: Metadata = { title: "Sign in — Split Signal" };

export default function SignInPage() {
  return <AuthPanel mode="sign-in" />;
}
