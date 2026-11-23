import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const extractErrorMessage = (err, fallbackMessage) => {
  if (err.code === 'ECONNABORTED') {
    return 'Yêu cầu quá thời gian. Vui lòng kiểm tra kết nối và thử lại';
  }
  return (
    err.response?.data?.message ||
    err.response?.data?.error?.message ||
    fallbackMessage
  );
};
let latestJobsReqId = 0;
let latestMyJobsReqId = 0;
let latestJobDetailReqId = 0;

const initialFilters = {
  keyword: '',
  category: '',
  location: '',
  jobType: '',
  page: 1,
  limit: 9,
};

const useJobStore = create((set, get) => ({
  jobs: [],
  myJobs: [],
  currentJob: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  },
  filters: { ...initialFilters },
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 1,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters } });
  },

  fetchJobs: async (overrideParams = {}) => {
    const reqId = ++latestJobsReqId;
    const mergedFilters = { ...get().filters, ...overrideParams };

    const params = Object.fromEntries(
      Object.entries(mergedFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );

    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/jobs', { params });
      if (reqId !== latestJobsReqId) return;

      set({
        jobs: res.data.data || [],
        pagination: res.data.pagination || {
          total: 0,
          page: 1,
          limit: 9,
          totalPages: 1,
        },
        isLoading: false,
      });
    } catch (err) {
      if (reqId !== latestJobsReqId) return;
      set({
        error: extractErrorMessage(err, 'Không thể tải danh sách việc làm'),
        isLoading: false,
      });
    }
  },

  fetchMyJobs: async () => {
    const reqId = ++latestMyJobsReqId;
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/jobs/employer/me');
      if (reqId !== latestMyJobsReqId) return;

      set({
        myJobs: res.data.data || [],
        isLoading: false,
      });
    } catch (err) {
      if (reqId !== latestMyJobsReqId) return;
      set({
        error: extractErrorMessage(err, 'Không thể tải danh sách tin đã đăng'),
        isLoading: false,
      });
    }
  },

  fetchJobById: async (id) => {
    const reqId = ++latestJobDetailReqId;
    set({ isLoading: true, error: null, currentJob: null });
    try {
      const res = await apiClient.get(`/jobs/${id}`);
      if (reqId !== latestJobDetailReqId) return;

      set({
        currentJob: res.data.data || null,
        isLoading: false,
      });
    } catch (err) {
      if (reqId !== latestJobDetailReqId) return;
      set({
        error: extractErrorMessage(err, 'Không tìm thấy tin tuyển dụng'),
        isLoading: false,
      });
    }
  },

  createJob: async (jobData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/jobs', jobData);
      const createdJob = res.data.data;

      set((state) => ({
        myJobs: [createdJob, ...state.myJobs],
        jobs: createdJob.status === 'active' ? [createdJob, ...state.jobs] : state.jobs,
        isLoading: false,
      }));

      return { success: true, data: createdJob };
    } catch (err) {
      const message = extractErrorMessage(err, 'Không thể đăng tin tuyển dụng');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateJob: async (id, jobData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.put(`/jobs/${id}`, jobData);
      const updatedJob = res.data.data;

      set((state) => ({
        myJobs: state.myJobs.map((item) => (item._id === id ? updatedJob : item)),
        jobs: state.jobs.map((item) => (item._id === id ? updatedJob : item)),
        currentJob: state.currentJob?._id === id ? updatedJob : state.currentJob,
        isLoading: false,
      }));

      return { success: true, data: updatedJob };
    } catch (err) {
      const message = extractErrorMessage(err, 'Không thể cập nhật tin tuyển dụng');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteJob: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/jobs/${id}`);

      set((state) => ({
        myJobs: state.myJobs.filter((item) => item._id !== id),
        jobs: state.jobs.filter((item) => item._id !== id),
        currentJob: state.currentJob?._id === id ? null : state.currentJob,
        isLoading: false,
      }));

      return { success: true };
    } catch (err) {
      const message = extractErrorMessage(err, 'Không thể xóa tin tuyển dụng');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));
export default useJobStore;