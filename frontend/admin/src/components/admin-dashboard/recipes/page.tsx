import OwnerDashboard from '../OwnerDashboard';

export const metadata = {
  title: 'Tavonza — Recipes & Food Cost Management',
  description: 'Manage culinary recipes, food costs, margins, and ingredient breakdowns.',
};

export default function RecipesPage() {
  return <OwnerDashboard initialNav="Recipes" />;
}
