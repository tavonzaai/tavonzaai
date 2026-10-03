import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Documents & Compliance Management',
  description: 'Store and manage hospitality business documents, licenses, certificates, and contracts securely.',
};

export default function DocumentsPage() {
  return <OwnerDashboard initialNav="Documents" />;
}
