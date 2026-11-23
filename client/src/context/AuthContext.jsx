import { useEffect, useState } from 'react';

import { getCurrentUser, loginAccount } from '../api/authUserApi.js';
import {
  getAccessToken,
  onUnauthorized,
  setAccessToken,
} from '../api/axiosClient.js';
import { AuthContext } from './useAuth.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));
  const [restoreError, setRestoreError] = useState('');
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  useEffect(() => onUnauthorized(() => {
    setUser(null);
    setRestoreError('');
    setLoading(false);
  }), []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let active = true;
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser({ signal: controller.signal });
        if (active && token === getAccessToken()) setUser(currentUser);
      } catch (error) {
        if (!active || controller.signal.aborted || token !== getAccessToken()) return;

        if (error.response?.status === 401) {
          setAccessToken(null);
          setUser(null);
        } else {
          // Lỗi mạng hoặc lỗi máy chủ không đồng nghĩa với token hết hạn.
          setRestoreError('Chưa thể xác minh phiên đăng nhập. Hãy kiểm tra kết nối và thử lại.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
      controller.abort();
    };
  }, [restoreAttempt]);

  async function login(credentials) {
    const session = await loginAccount(credentials);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setRestoreError('');
    setLoading(false);
    return session.user;
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
    setRestoreError('');
    setLoading(false);
  }

  function retryRestore() {
    if (!getAccessToken()) {
      logout();
      return;
    }
    setRestoreError('');
    setLoading(true);
    setRestoreAttempt((attempt) => attempt + 1);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {loading ? (
        <main className="grid min-h-svh place-items-center bg-slate-50 p-6 text-slate-600" role="status" aria-live="polite">
          <p>Đang khôi phục phiên đăng nhập…</p>
        </main>
      ) : restoreError ? (
        <main className="grid min-h-svh place-items-center bg-slate-50 p-6 text-slate-700">
          <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
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
          </section>
        </main>
      ) : children}
    </AuthContext.Provider>
  );
}