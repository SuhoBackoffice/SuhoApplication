import axios from "axios";
import { API_ENDPOINTS, ApiResponse } from "@/api/apiConfig";
import {
  ProjectFormData,
  ProjectCreateResponse,
  ProjectDetail,
  VersionItem,
} from "@/types/project";

export async function createProject(
  data: ProjectFormData
): Promise<ApiResponse<ProjectCreateResponse>> {
  const response = await axios.post(API_ENDPOINTS.project, data);
  return {
    success: response.data.isSuccess,
    data: response.data.data,
    message: response.data.message,
    code: response.data.code,
  };
}

export async function getProjectDetail(
  projectId: number
): Promise<ApiResponse<ProjectDetail>> {
  const response = await axios.get(`${API_ENDPOINTS.project}/${projectId}`);
  return {
    success: response.data.isSuccess,
    data: response.data.data,
    message: response.data.message,
    code: response.data.code,
  };
}

export async function getVersions(): Promise<ApiResponse<VersionItem[]>> {
  const response = await axios.get(API_ENDPOINTS.projectVersion);
  return {
    success: response.data.isSuccess,
    data: response.data.data,
    message: response.data.message,
    code: response.data.code,
  };
}
