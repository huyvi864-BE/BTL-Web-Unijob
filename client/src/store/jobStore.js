import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useJobStore = create((set, get) => ({
  jobs: [],
  myJobs: [],
  currentJob: null,
  pagination: {
    total: 0,
    page: 1,
    totalPages: 1,
  },
  filters: {
    keyword: '',
    category: '',
    location: '',
    jobType: '',
  },
  isLoading: false,
  error: null,
  
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () =>
    set({
      filters: {
        keyword: '',
        category: '',
        location: '',
        jobType: '',
      },
    }),

  fetchJobs: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = { page, limit: 9 };

      if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
      if (filters.category) params.category = filters.category;
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.jobType) params.jobType = filters.jobType;

      const res = await axios.get(`${API_URL}/jobs`, { params });
      set({
        jobs: res.data.data,
        pagination: res.data.pagination,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Không thể tải danh sách việc làm',
        isLoading: false,
      });
    }
  },
  fetchJobById: async (id) => {
    set({ isLoading: true, error: null, currentJob: null });
    try {
      const res = await axios.get(`${API_URL}/jobs/${id}`);
      set({ currentJob: res.data.data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Không tìm thấy tin tuyển dụng',
        isLoading: false,
      });
    }
  },

  fetchMyJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/jobs/employer/me`);
      set({ myJobs: res.data.data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Không thể tải danh sách tin đã đăng',
        isLoading: false,
      });
    }
  },
}));

export default useJobStore;