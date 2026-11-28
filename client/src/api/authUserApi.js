import api from './axiosClient.js';

export async function registerAccount(body) {
  const { data } = await api.post('/auth/register', body, {
    publicRequest: true,
  });

  return data;
}

export async function loginAccount(body, { signal } = {}) {
  const { data } = await api.post('/auth/login', body, {
    publicRequest: true,
    signal,
  });

  return data;
}

export async function getCurrentUser({ signal } = {}) {
  const { data } = await api.get('/users/me', { signal });
  return data.user;
}
