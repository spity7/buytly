import GuestAuthRedirect from "@/components/auth/GuestAuthRedirect";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Register");

export default function Register() {
  return <GuestAuthRedirect authTab="signup" />;
}
