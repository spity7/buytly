import GuestAuthRedirect from "@/components/auth/GuestAuthRedirect";

export const metadata = {
  title: "Register",
};

export default function Register() {
  return <GuestAuthRedirect authTab="signup" />;
}
