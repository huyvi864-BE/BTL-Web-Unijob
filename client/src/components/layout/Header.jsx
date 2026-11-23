import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/useAuth.js';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 p-4">
        <Link to="/" className="text-xl font-bold text-blue-800">
          UniJob
        </Link>

        {!user && (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <Link to="/student/profile">Hồ sơ</Link>
            <Link to="/student/applications">Đơn ứng tuyển</Link>
          </>
        )}

        {user?.role === 'employer' && (
          <>
            <Link to="/employer/profile">Doanh nghiệp</Link>
            <Link to="/employer/jobs">Quản lý tin</Link>
          </>
        )}

        {user && (
          <>
            <span className="break-words">{user.name}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-blue-700 underline"
            >
              Đăng xuất
            </button>
          </>
        )}
      </nav>
    </header>
  );
}