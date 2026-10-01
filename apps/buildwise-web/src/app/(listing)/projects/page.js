import { redirect } from "next/navigation";

export const metadata = {
  title: "Projects",
  description: "Browse development projects and multi-unit listings for sale.",
};

export default function ProjectsBrowsePage() {
  redirect("/listings?view=projects");
}
