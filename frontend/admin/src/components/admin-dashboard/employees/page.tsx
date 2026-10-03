import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Employees Management & Scheduling',
  description: 'Manage staff profiles, track server accuracy and ratings, manage shift schedules, and add new team members.',
};

export default function EmployeesPage() {
  return <OwnerDashboard initialNav="Employees" />;
}
