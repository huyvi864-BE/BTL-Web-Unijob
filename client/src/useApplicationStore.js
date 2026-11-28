import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const emptyStats = {
  total: 0,
  pending: 0,
  reviewing: 0,
  accepted: 0,
  rejected: 0,
};

export const useApplicationStore = create((set, get) => ({
  myApplications: [],
  employerApplications: [],
  stats: emptyStats,
  loading: false,

  submitApplication: async ({ jobId, cvUrl, cvFile, coverLetter }) => {
    set({ loading: true });
    try {
      let payload;
      if (cvFile) {
        payload = new FormData();
        payload.append('jobId', jobId);
        payload.append('cvFile', cvFile);
        if (cvUrl) payload.append('cvUrl', cvUrl);
        if (coverLetter) payload.append('coverLetter', coverLetter);
      } else {
        payload = { jobId, cvUrl, coverLetter };
      }

      const res = await api.post('/applications', payload);
      toast.success(res.data.message || 'Nộp hồ sơ thành công');
      await get().fetchMyApplications();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Nộp hồ sơ thất bại');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchMyApplications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/applications/me');
      set({ myApplications: res.data.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi tải danh sách đã ứng tuyển');
    } finally {
      set({ loading: false });
    }
  },

  fetchEmployerApplications: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await api.get('/applications/employer', { params });
      set({
        employerApplications: res.data.data || [],
        stats: res.data.stats || emptyStats,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi tải danh sách ứng viên');
    } finally {
      set({ loading: false });
    }
  },

  updateStatus: async (id, status) => {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      toast.success('Đã cập nhật trạng thái đơn');
      await get().fetchEmployerApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  },

  deleteApplication: async (id, role = 'student') => {
    try {
      await api.delete(`/applications/${id}`);
      toast.success(role === 'student' ? 'Đã rút đơn ứng tuyển' : 'Đã xóa đơn ứng tuyển');
      if (role === 'student') {
        await get().fetchMyApplications();
      } else {
        await get().fetchEmployerApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa đơn thất bại');
    }
  },
}));