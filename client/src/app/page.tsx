import { RequireAuth } from '@/components/auth/RequireAuth';
import { Dashboard } from '@/components/dashboard/Dashboard';

export default function HomePage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
