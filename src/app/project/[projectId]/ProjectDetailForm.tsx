"use client";

import { ProjectDetail } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectDetailForm({
  initialData,
}: {
  initialData: ProjectDetail;
}) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">프로젝트 상세</h1>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div>
            <strong>프로젝트 이름:</strong> {initialData.projectName}
          </div>
          <div>
            <strong>시작일:</strong>{" "}
            {new Date(initialData.startDate).toLocaleDateString()}
          </div>
          <div>
            <strong>버전:</strong> {initialData.versionName}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">분기 정보</h2>
          {initialData.branches.map((branch) => (
            <div
              key={branch.branchCode}
              className="flex justify-between border-b py-1"
            >
              <span>분기 번호: {branch.branchCode}</span>
              <span>수량: {branch.branchQuantity}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
