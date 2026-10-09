import { buildAuthEntryUrl } from "@/lib/auth/authIntent";
import { redirect } from "next/navigation";

function firstParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

// Sign-up lives on the auth entry page; keep role/next/intent for the form.
export default async function Register({ searchParams }) {
  const params = await searchParams;

  redirect(
    buildAuthEntryUrl({
      tab: "signup",
      role: firstParam(params?.role),
      next: firstParam(params?.next),
      intent: firstParam(params?.intent),
    }),
  );
}
