import axios from 'axios';

const base = axios.create({ baseURL: '/api/auth', withCredentials: true });

export const authApi = {
  register: async (email: string, name: string, password: string) => {
    const { data } = await base.post<{ accessToken: string }>('/register', { email, name, password });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await base.post<{ accessToken: string }>('/login', { email, password });
    return data;
  },
  refresh: async () => {
    const { data } = await base.post<{ accessToken: string }>('/refresh');
    return data;
  },
  logout: async () => {
    await base.post('/logout');
  },
  me: async (token: string) => {
    const { data } = await base.get('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
