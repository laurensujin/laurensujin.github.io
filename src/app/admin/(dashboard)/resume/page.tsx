import { ResumeManager } from "@/components/admin/ResumeManager";
import { listResumeFiles } from "@/lib/data/admin";

export default async function ResumePage() {
  const files = await listResumeFiles();
  return <ResumeManager files={files} />;
}
