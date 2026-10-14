export interface RestaurantFormData {
  name: string;
  status: 'Active' | 'Setup' | 'Closed';
  description: string;
}
