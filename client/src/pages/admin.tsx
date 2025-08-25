import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect admin users to their proper dashboard
  if (user?.role === 'admin') {
    navigate('/admin-dashboard');
    return null;
  }

  // If not admin, show access denied message
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          System Administration features are only available to Super Administrators.
        </p>
        <p className="text-gray-600">
          Please contact your Super Administrator for access to system settings.
        </p>
      </div>
    </div>
  );
}