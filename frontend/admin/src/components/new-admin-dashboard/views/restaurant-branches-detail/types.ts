export interface BranchFormData {
  name: string;
  address: string;
  contactNumber: string;
  manager: string;
  status: 'Active' | 'Setup' | 'Closed';
  openingTime: string;
  closingTime: string;
}
