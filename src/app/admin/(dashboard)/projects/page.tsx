import { ProjectsList } from "@/components/admin/ProjectsList";
import { listProjectsForAdmin } from "@/lib/data/admin";

export default async function ProjectsPage() {
  const projects = await listProjectsForAdmin();
  return <ProjectsList projects={projects} />;
}
