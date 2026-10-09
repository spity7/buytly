import ForgotPasswordForm from "@/components/pages/auth/ForgotPasswordForm";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Forgot Password");

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
