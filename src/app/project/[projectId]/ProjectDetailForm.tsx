"use client";

import { useState, useRef, useEffect } from "react";
import { ProjectDetail } from "@/types/project";
import { Card, CardContent } from "@/components/ui/card";
import { updateBranchBom } from "@/lib/api/branch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getBranchBom } from "@/lib/api/branch";
import { Skeleton } from "@/components/ui/skeleton"; // shadcn ui 컴포넌트
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BranchBomResponse } from "@/types/branch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function ProjectDetailForm({
  initialData,
}: {
  initialData: ProjectDetail;
}) {
  const [fileMap, setFileMap] = useState<Record<number, File | null>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<number, boolean>>({});
  const [uploadedMap, setUploadedMap] = useState<Record<number, boolean>>({});

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [branchBoms, setBranchBoms] = useState<BranchBomResponse[]>([]);
  const [isBomLoading, setIsBomLoading] = useState<boolean>(false);
  const [bomError, setBomError] = useState<string | null>(null);

  const handleFileSelect = (branchCode: number) => {
    fileInputRefs.current[branchCode]?.click();
  };

  const handleFileChange = (branchCode: number, file: File | null) => {
    setFileMap((prev) => ({ ...prev, [branchCode]: file }));
    setUploadedMap((prev) => ({ ...prev, [branchCode]: false }));
  };

  const handleUpload = async (branchCode: number) => {
    const file = fileMap[branchCode];
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingMap((prev) => ({ ...prev, [branchCode]: true }));

      const response = await updateBranchBom(
        initialData.projectId,
        branchCode,
        formData
      );

      if (response.success) {
        alert("업로드 성공!");
        setUploadedMap((prev) => ({ ...prev, [branchCode]: true }));
      } else {
        alert(`업로드 실패: ${response.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingMap((prev) => ({ ...prev, [branchCode]: false }));
    }
  };

  useEffect(() => {
    async function fetchBranchBom() {
      try {
        setIsBomLoading(true);
        const response = await getBranchBom(initialData.projectId);

        if (response.success) {
          setBranchBoms(response.data ?? []); // null이면 그냥 빈 배열
        } else {
          setBranchBoms([]); // 실패해도 안전하게 빈 배열
          setBomError(response.message ?? "BOM을 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error(error);
        setBranchBoms([]);
        setBomError("BOM을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsBomLoading(false);
      }
    }

    fetchBranchBom();
  }, [initialData.projectId]);

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
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-2">분기 정보</h2>

          {initialData.branches.map((branch) => {
            const isUploading = uploadingMap[branch.branchCode];
            const isUploaded = uploadedMap[branch.branchCode];
            const selectedFile = fileMap[branch.branchCode];

            return (
              <div
                key={branch.branchCode}
                className="flex flex-col gap-2 border-b py-2"
              >
                <div className="flex justify-between">
                  <span>분기 번호: {branch.branchCode}</span>
                  <span>수량: {branch.branchQuantity}</span>
                  <span>Branch Id: {branch.branchId}</span>
                  <span>
                    등록 여부: {branch.isRegistered ? "등록됨" : "미등록"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 숨겨진 input */}
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={(el) => {
                      fileInputRefs.current[branch.branchCode] = el;
                    }}
                    onChange={(e) =>
                      handleFileChange(
                        branch.branchCode,
                        e.target.files?.[0] ?? null
                      )
                    }
                    className="hidden"
                    disabled={isUploaded}
                  />

                  {/* 파일 선택 버튼 */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleFileSelect(branch.branchCode)}
                    disabled={isUploaded}
                  >
                    {selectedFile ? selectedFile.name : "파일 선택"}
                  </Button>

                  {/* 업로드 버튼 */}
                  <Button
                    type="button"
                    onClick={() => handleUpload(branch.branchCode)}
                    disabled={!selectedFile || isUploading || isUploaded}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : isUploaded ? (
                      "업로드 완료!"
                    ) : (
                      "업로드"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold mb-2">BOM 목록</h2>

          {isBomLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <Skeleton key={idx} className="h-6 w-full" />
              ))}
            </div>
          )}

          {bomError && (
            <Alert variant="destructive">
              <AlertTitle>에러</AlertTitle>
              <AlertDescription>{bomError}</AlertDescription>
            </Alert>
          )}

          {!isBomLoading && !bomError && branchBoms.length === 0 && (
            <div>등록된 BOM이 없습니다.</div>
          )}

          {!isBomLoading && !bomError && branchBoms.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>품명</TableHead>
                    <TableHead>도번</TableHead>
                    <TableHead>규격</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead>단위</TableHead>
                    <TableHead>사급자재</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchBoms.map((bom, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{bom.itemName}</TableCell>
                      <TableCell>{bom.drawingCode}</TableCell>
                      <TableCell>{bom.specification}</TableCell>
                      <TableCell>{bom.quantity}</TableCell>
                      <TableCell>{bom.branchItemUnit}</TableCell>
                      <TableCell>
                        {bom.isConsignMaterial ? "예" : "아니오"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
