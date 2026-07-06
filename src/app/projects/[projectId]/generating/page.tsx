import { CreativeWorkshopLoader } from "@/components/generating/creative-workshop-loader";

export default async function ProjectGeneratingPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ jobId?: string; dayName?: string }>;
}) {
  const { projectId } = await params;
  const { jobId, dayName } = await searchParams;

  return (
    <CreativeWorkshopLoader
      mode="regenerate"
      projectId={projectId}
      focusJobId={jobId}
      focusDayName={dayName}
    />
  );
}
