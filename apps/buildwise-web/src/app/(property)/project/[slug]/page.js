import ProjectDetailClient from "./ProjectDetailClient";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Project Details");

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  return <ProjectDetailClient slug={slug} />;
}
