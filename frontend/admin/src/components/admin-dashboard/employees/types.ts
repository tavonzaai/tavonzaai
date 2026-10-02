export type EmployeeRole =
  | 'Head Waiter'
  | 'Waiter'
  | 'Chef'
  | 'Head Chef'
  | 'Bartender'
  | 'Barista'
  | 'Hostess'
  | 'Host'
  | 'Manager';

export type EmployeeShiftType =
  | 'Morning'
  | 'Evening'
  | 'Night'
  | 'Full Day'
  | 'Custom';

export type EmployeeStatus = 'On Shift' | 'On Duty' | 'Off Duty' | 'On Break';

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  shiftHours: string;
  shiftType: EmployeeShiftType;
  rating: number;
  tablesToday: number;
  accuracy: number;
  phone: string;
  email: string;
  bio: string;
  notes?: string;
  hireDate: string;
  salary?: number;
}

export interface EmployeesKPIs {
  totalStaff: number;
  onShift: number;
  avgRating: number;
  tablesServed: number;
}
