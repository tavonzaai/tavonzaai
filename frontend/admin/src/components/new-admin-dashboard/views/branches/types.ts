export interface BranchFormData {
  restaurantId: string;
  restaurantName: string;
  name: string;
  address: string;
  contactNumber: string;
  manager: string;
  status: 'Active' | 'Setup' | 'Closed';
  openingTime: string;
  closingTime: string;
}
