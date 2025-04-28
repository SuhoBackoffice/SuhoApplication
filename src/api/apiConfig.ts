// API Base URL 설정
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// API End-point 정의
export const API_ENDPOINTS = {
  project: `${API_URL}/project`,
  projectVersion: `${API_URL}/project/version`,

  branch: (projectId: number, branchCode: number) =>
    `${API_URL}/branch/${projectId}/${branchCode}`,

  getBranchBom: (projectId: number) => `${API_URL}/branch/${projectId}`,
};

// API 응답 관련 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code: string;
}
