import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — QR Ordering & Table Management',
  description: 'Generate, print, and manage dynamic QR codes for every table.',
};

export default function QROrderingPage() {
  return <OwnerDashboard initialNav="QR Ordering" />;
}
