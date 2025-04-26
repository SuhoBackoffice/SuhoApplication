export interface ProductRow {
  productCode: number;
  quantity: string;
}

export interface ProjectFormData {
  projectName: string;
  startDate: Date;
  versionId: string;
  rows: ProductRow[];
}

export interface ProjectCreateResponse {
  projectId: number;
}

export interface VersionItem {
  versionId: number;
  versionName: string;
}

export interface ProjectDetail {
  projectName: string;
  startDate: Date;
  versionName: string;
  branches: {
    branchCode: number;
    branchQuantity: number;
  }[];
}
