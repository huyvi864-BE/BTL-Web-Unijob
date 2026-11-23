import { Link, Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/useAuth.js';

export default function ProtectedRoute({ role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">
          Bạn không có quyền mở trang này
        </h1>
        <Link to="/" className="mt-3 inline-block text-blue-700 underline">
          Về trang chủ
        </Link>
      </section>
    );
  }

  return <Outlet />;
}