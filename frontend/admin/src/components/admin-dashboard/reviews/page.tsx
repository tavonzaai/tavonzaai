import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Customer Reviews & Feedback Management',
  description: 'Monitor guest feedback, ratings breakdown, and respond to customer reviews in real-time.',
};

export default function ReviewsPage() {
  return <OwnerDashboard initialNav="Reviews" />;
}
