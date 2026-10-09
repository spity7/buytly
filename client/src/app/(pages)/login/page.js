import GuestAuthRedirect from "@/components/auth/GuestAuthRedirect";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Login");

export default function Login() {
  return <GuestAuthRedirect authTab="signin" />;
}
