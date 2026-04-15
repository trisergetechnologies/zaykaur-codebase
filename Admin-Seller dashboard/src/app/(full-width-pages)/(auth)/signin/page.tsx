import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Zaykaur Dashboard",
  description: "Sign in to Zaykaur Admin & Seller Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
