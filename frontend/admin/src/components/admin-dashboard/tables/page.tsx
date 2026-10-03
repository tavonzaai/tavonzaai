import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Live Floor Plan & Tables',
  description: 'Live floor plan - monitor occupancy and manage table assignments.',
};

export default function TablesPage() {
  return <OwnerDashboard initialNav="Tables" />;
}
