import { Link, Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/useAuth.js';

export default function ProtectedRoute({ role }) {
  const { user, loading, restoreError, retryRestore, logout } = useAuth();

  if (loading) {
    return (
      <section className="grid min-h-[60vh] place-items-center p-6 text-slate-600" role="status" aria-live="polite">
        <p>Đang khôi phục phiên đăng nhập…</p>
      </section>
    );
  }

  if (restoreError) {
    return (
      <section className="grid min-h-[60vh] place-items-center p-6 text-slate-700">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Chưa thể khôi phục phiên</h1>
          <p className="mt-3 text-sm leading-6" role="alert">{restoreError}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={retryRestore} className="rounded-xl bg-violet-700 px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
              Thử lại
            </button>
            <button type="button" onClick={logout} className="rounded-xl border border-slate-300 px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
              Đăng nhập lại
            </button>
          </div>
        </div>
      </section>
    );
  }

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
