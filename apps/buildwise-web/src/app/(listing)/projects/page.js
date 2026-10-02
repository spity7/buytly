import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Browse Projects", {
  description: "Browse development projects and multi-unit listings for sale.",
});

export default function ProjectsBrowsePage() {
  redirect("/listings?view=projects");
}
