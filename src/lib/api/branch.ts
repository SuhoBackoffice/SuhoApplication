import axios from "axios";
import { API_ENDPOINTS, ApiResponse } from "@/api/apiConfig";
import { BranchBomResponse } from "@/types/branch";

export async function updateBranchBom(
  projectId: number,
  branchCode: number,
  formData: FormData
): Promise<ApiResponse<null>> {
  const response = await axios.post(
    API_ENDPOINTS.branch(projectId, branchCode),
    formData
  );
  return {
    success: response.data.isSuccess,
    data: null,
    message: response.data.message,
    code: response.data.code,
  };
}

export async function getBranchBom(
  projectId: number
): Promise<ApiResponse<BranchBomResponse[]>> {
  const response = await axios.get(API_ENDPOINTS.getBranchBom(projectId));
  return {
    success: response.data.isSuccess,
    data: response.data.data,
    message: response.data.message,
    code: response.data.code,
  };
}
