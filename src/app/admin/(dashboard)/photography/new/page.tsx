import { PhotographySetForm } from "@/components/admin/PhotographySetForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewPhotographySetPage() {
  return (
    <>
      <PageHeader title="New photo set" />
      <PhotographySetForm />
    </>
  );
}
