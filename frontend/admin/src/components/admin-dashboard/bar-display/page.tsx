import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Bar Display System (BDS)',
  description: 'Live drink queue, cocktail mixing management, and bar operations.',
};

export default function BarDisplayPage() {
  return <OwnerDashboard initialNav="Bar Display" />;
}
