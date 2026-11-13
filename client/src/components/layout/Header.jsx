import { Link } from 'react-router';

export default function Header() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 p-4">
        <Link to="/" className="font-bold text-blue-800">UniJob</Link>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/register">Đăng ký</Link>
      </nav>
    </header>
  );
}