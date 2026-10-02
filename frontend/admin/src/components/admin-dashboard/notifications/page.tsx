import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Real-Time Operations Notifications',
  description: 'Stay on top of your restaurant operations with real-time alerts for orders, inventory, reviews, and AI insights.',
};

export default function NotificationsPage() {
  return <OwnerDashboard initialNav="Notifications" />;
}
