import { notFound } from "next/navigation";
import { getProjectDetail } from "@/lib/api/project";
import { ProjectDetail } from "@/types/project";
import ProjectDetailForm from "./ProjectDetailForm";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectIdNum = Number(projectId);

  if (isNaN(projectIdNum)) {
    notFound();
  }

  try {
    const result = await getProjectDetail(projectIdNum);

    if (!result.success || !result.data) {
      notFound();
    }

    return <ProjectDetailForm initialData={result.data as ProjectDetail} />;
  } catch (error) {
    console.error("프로젝트 조회 실패:", error);
    notFound(); // 에러가 발생해도 notFound로 보내버림
  }
}
