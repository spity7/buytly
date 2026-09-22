import ProjectDetailClient from "./ProjectDetailClient";

export const metadata = {
  title: "Project | Buytly",
};

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  return <ProjectDetailClient slug={slug} />;
}
