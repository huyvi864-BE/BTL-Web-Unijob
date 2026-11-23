import { useCallback, useEffect, useRef, useState } from 'react';
import { CanceledError } from 'axios';

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
  const requestGeneration = useRef(0);
  const pendingRequest = useRef(null);

  const cancelPendingRequest = useCallback(() => {
    requestGeneration.current += 1;
    pendingRequest.current?.abort();
    pendingRequest.current = null;
  }, []);

  useEffect(() => () => cancelPendingRequest(), [cancelPendingRequest]);

  useEffect(() => onUnauthorized(() => {
    cancelPendingRequest();
    setUser(null);
    setRestoreError('');
    setLoading(false);
  }), [cancelPendingRequest]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    cancelPendingRequest();
    const generation = requestGeneration.current;
    const controller = new AbortController();
    pendingRequest.current = controller;

    function isCurrentRequest() {
      return !controller.signal.aborted
        && generation === requestGeneration.current
        && token === getAccessToken();
    }

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser({ signal: controller.signal });
        if (isCurrentRequest()) setUser(currentUser);
      } catch (error) {
        if (!isCurrentRequest()) return;

        if (error.response?.status === 401) {
          setAccessToken(null);
          setUser(null);
        } else {
          setRestoreError('Chưa thể xác minh phiên đăng nhập. Hãy kiểm tra kết nối và thử lại.');
        }
      } finally {
        if (!controller.signal.aborted && generation === requestGeneration.current) {
          setLoading(false);
        }
        if (pendingRequest.current === controller) pendingRequest.current = null;
      }
    }

    restoreSession();
    return () => {
      controller.abort();
      if (pendingRequest.current === controller) pendingRequest.current = null;
    };
  }, [restoreAttempt, cancelPendingRequest]);

  async function login(credentials) {
    cancelPendingRequest();
    const generation = requestGeneration.current;
    const controller = new AbortController();
    pendingRequest.current = controller;
    setAccessToken(null);
    setUser(null);
    setRestoreError('');
    setLoading(false);

    try {
      const session = await loginAccount(credentials, { signal: controller.signal });

      if (controller.signal.aborted || generation !== requestGeneration.current) {
        throw new CanceledError('Yêu cầu đăng nhập đã được thay thế.');
      }

      setAccessToken(session.accessToken);
      setUser(session.user);
      return session.user;
    } catch (error) {
      if (controller.signal.aborted || generation !== requestGeneration.current) {
        throw new CanceledError('Yêu cầu đăng nhập đã được thay thế.');
      }
      throw error;
    } finally {
      if (pendingRequest.current === controller) pendingRequest.current = null;
    }
  }

  function logout() {
    cancelPendingRequest();
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
    cancelPendingRequest();
    setRestoreError('');
    setLoading(true);
    setRestoreAttempt((attempt) => attempt + 1);
  }

  return (
    <AuthContext.Provider value={{ user, loading, restoreError, retryRestore, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
