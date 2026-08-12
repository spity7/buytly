import GuestAuthRedirect from "@/components/auth/GuestAuthRedirect";

export const metadata = {
  title: "Login",
};

export default function Login() {
  return <GuestAuthRedirect authTab="signin" />;
}
