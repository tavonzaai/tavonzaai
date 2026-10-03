export type DocumentCategory =
  | 'Compliance'
  | 'Legal'
  | 'Operations'
  | 'HR'
  | 'Contracts'
  | 'Finance';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  size: string;
  uploadedBy: string;
  date: string;
  status: DocumentStatus;
  fileType?: string; // e.g. 'PDF', 'DOCX', 'XLSX'
  expiryDate?: string;
}

export interface DocumentKPIs {
  totalDocuments: number;
  validCount: number;
  expiringSoonCount: number;
  categoriesCount: number;
}

export interface DocumentCategoryInfo {
  category: DocumentCategory;
  count: number;
}
