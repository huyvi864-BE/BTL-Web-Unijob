import { create } from 'zustand';
import axios from 'axios';
import { normalizeJobCategory } from '../components/jobs/JobFilterBar';

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

export const isDeadlineExpired = (deadline) => {
  if (!deadline) return false;

  if (
    typeof deadline === 'string' &&
    /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(deadline.trim())
  ) {
    const datePart = deadline.trim().slice(0, 10);
    const endOfDay = new Date(`${datePart}T23:59:59.999`);
    return !Number.isNaN(endOfDay.getTime()) && endOfDay < new Date();
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return false;

  if (
    parsed.getUTCHours() === 0 &&
    parsed.getUTCMinutes() === 0 &&
    parsed.getUTCSeconds() === 0 &&
    parsed.getUTCMilliseconds() === 0
  ) {
    const datePart = parsed.toISOString().slice(0, 10);
    return new Date(`${datePart}T23:59:59.999`) < new Date();
  }

  return parsed < new Date();
};
const matchesCurrentFilters = (job, filters) => {
  if (!job || job.status !== 'active' || isDeadlineExpired(job.deadline)) {
    return false;
  }
  if (
    filters.category &&
    normalizeJobCategory(job.category) !== normalizeJobCategory(filters.category)
  ) {
    return false;
  }
  if (filters.jobType && job.jobType !== filters.jobType) {
    return false;
  }
  if (
    filters.location?.trim() &&
    !job.location?.toLowerCase().includes(filters.location.trim().toLowerCase())
  ) {
    return false;
  }
  if (filters.keyword?.trim()) {
    const kw = filters.keyword.trim().toLowerCase();
    const matched =
      job.title?.toLowerCase().includes(kw) ||
      job.companyName?.toLowerCase().includes(kw);
    if (!matched) return false;
  }
  return true;
};

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};
let latestJobsReqId = 0;
let latestMyJobsReqId = 0;
let latestJobDetailReqId = 0;
let jobsMutationGen = 0;
let myJobsMutationGen = 0;
const latestUpdateSeqById = new Map();

const initialFilters = {
  keyword: '',
  category: '',
  location: '',
  jobType: '',
  page: 1,
  limit: 9,
};

const useJobStore = create((set, get) => {
  const adjustCounter = (counterKey, delta) => {
    set((state) => {
      const nextCount = Math.max(0, state[counterKey] + delta);
      const counts = {
        activeJobsCount: state.activeJobsCount,
        activeMyJobsCount: state.activeMyJobsCount,
        activeDetailCount: state.activeDetailCount,
        activeMutatingCount: state.activeMutatingCount,
        [counterKey]: nextCount,
      };
      const totalActive =
        counts.activeJobsCount +
        counts.activeMyJobsCount +
        counts.activeDetailCount +
        counts.activeMutatingCount;

      return {
        ...counts,
        isFetchingJobs: counts.activeJobsCount > 0,
        isFetchingMyJobs: counts.activeMyJobsCount > 0,
        isFetchingDetail: counts.activeDetailCount > 0,
        isMutating: counts.activeMutatingCount > 0,
        isLoading: totalActive > 0,
      };
    });
  };

  return {
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
    activeJobsCount: 0,
    activeMyJobsCount: 0,
    activeDetailCount: 0,
    activeMutatingCount: 0,
    isFetchingJobs: false,
    isFetchingMyJobs: false,
    isFetchingDetail: false,
    isMutating: false,
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
      const startGen = jobsMutationGen;

      const normalizedOverrides =
        typeof overrideParams === 'number'
          ? { page: overrideParams }
          : overrideParams && typeof overrideParams === 'object'
            ? overrideParams
            : {};

      const mergedFilters = { ...get().filters, ...normalizedOverrides };
      if (Object.keys(normalizedOverrides).length > 0) {
        set({ filters: mergedFilters });
      }

      const params = Object.fromEntries(
        Object.entries(mergedFilters).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined
        )
      );

      set({ error: null });
      adjustCounter('activeJobsCount', 1);

      try {
        const res = await apiClient.get('/jobs', { params });
        if (reqId !== latestJobsReqId || startGen !== jobsMutationGen) return;

        set({
          jobs: res.data.data || [],
          pagination: res.data.pagination || {
            total: 0,
            page: mergedFilters.page,
            limit: mergedFilters.limit,
            totalPages: 1,
          },
        });
      } catch (err) {
        if (reqId !== latestJobsReqId) return;
        set({
          error: extractErrorMessage(err, 'Không thể tải danh sách việc làm'),
        });
      } finally {
        adjustCounter('activeJobsCount', -1);
      }
    },

    fetchMyJobs: async () => {
      const reqId = ++latestMyJobsReqId;
      const startGen = myJobsMutationGen;

      set({ error: null });
      adjustCounter('activeMyJobsCount', 1);

      try {
        const res = await apiClient.get('/jobs/employer/me');
        if (reqId !== latestMyJobsReqId || startGen !== myJobsMutationGen) return;

        set({
          myJobs: res.data.data || [],
        });
      } catch (err) {
        if (reqId !== latestMyJobsReqId) return;
        set({
          error: extractErrorMessage(err, 'Không thể tải danh sách tin đã đăng'),
        });
      } finally {
        adjustCounter('activeMyJobsCount', -1);
      }
    },

    fetchJobById: async (id) => {
      const reqId = ++latestJobDetailReqId;
      set({ error: null, currentJob: null });
      adjustCounter('activeDetailCount', 1);

      try {
        const res = await apiClient.get(`/jobs/${id}`);
        if (reqId !== latestJobDetailReqId) return;

        set({
          currentJob: res.data.data || null,
        });
      } catch (err) {
        if (reqId !== latestJobDetailReqId) return;
        set({
          error: extractErrorMessage(err, 'Không tìm thấy tin tuyển dụng'),
        });
      } finally {
        adjustCounter('activeDetailCount', -1);
      }
    },

    createJob: async (jobData, idempotencyKey) => {
      const key = idempotencyKey || generateIdempotencyKey();
      jobsMutationGen += 1;
      myJobsMutationGen += 1;

      set({ error: null });
      adjustCounter('activeMutatingCount', 1);

      try {
        const res = await apiClient.post('/jobs', jobData, {
          headers: { 'Idempotency-Key': key },
        });
        const createdJob = res.data?.data;

        if (!createdJob || !createdJob._id) {
          throw new Error('Phản hồi tạo tin tuyển dụng không hợp lệ');
        }

        jobsMutationGen += 1;
        myJobsMutationGen += 1;

        set((state) => {
          const existsInMyJobs = state.myJobs.some(
            (item) => item._id === createdJob._id
          );
          const nextMyJobs = existsInMyJobs
            ? state.myJobs.map((item) =>
                item._id === createdJob._id ? createdJob : item
              )
            : [createdJob, ...state.myJobs];

          const shouldShowInJobs =
            state.filters.page === 1 &&
            matchesCurrentFilters(createdJob, state.filters);
          const existsInJobs = state.jobs.some(
            (item) => item._id === createdJob._id
          );
          const nextJobs = shouldShowInJobs
            ? existsInJobs
              ? state.jobs.map((item) =>
                  item._id === createdJob._id ? createdJob : item
                )
              : [createdJob, ...state.jobs].slice(0, state.filters.limit)
            : state.jobs;

          return {
            myJobs: nextMyJobs,
            jobs: nextJobs,
          };
        });

        return { success: true, data: createdJob };
      } catch (err) {
        const message = extractErrorMessage(err, 'Không thể đăng tin tuyển dụng');
        set({ error: message });
        throw new Error(message);
      } finally {
        adjustCounter('activeMutatingCount', -1);
      }
    },

    updateJob: async (id, jobData) => {
      const seq = (latestUpdateSeqById.get(id) || 0) + 1;
      latestUpdateSeqById.set(id, seq);
      jobsMutationGen += 1;
      myJobsMutationGen += 1;

      set({ error: null });
      adjustCounter('activeMutatingCount', 1);

      try {
        const res = await apiClient.put(`/jobs/${id}`, jobData);
        const updatedJob = res.data?.data;
        if (!updatedJob || !updatedJob._id) {
          throw new Error('Không nhận được dữ liệu tin tuyển dụng sau khi cập nhật');
        }

        if (latestUpdateSeqById.get(id) !== seq) {
          return { success: true, data: updatedJob };
        }

        jobsMutationGen += 1;
        myJobsMutationGen += 1;

        set((state) => {
          const stillMatches = matchesCurrentFilters(updatedJob, state.filters);
          const alreadyInJobs = state.jobs.some((item) => item._id === id);

          let nextJobs = state.jobs;
          if (alreadyInJobs && !stillMatches) {
            nextJobs = state.jobs.filter((item) => item._id !== id);
          } else if (alreadyInJobs && stillMatches) {
            nextJobs = state.jobs.map((item) =>
              item._id === id ? updatedJob : item
            );
          }

          return {
            myJobs: state.myJobs.map((item) =>
              item._id === id ? updatedJob : item
            ),
            jobs: nextJobs,
            currentJob:
              state.currentJob?._id === id ? updatedJob : state.currentJob,
          };
        });
        get().fetchJobs();

        return { success: true, data: updatedJob };
      } catch (err) {
        if (err.response?.status === 404) {
          set((state) => ({
            myJobs: state.myJobs.filter((item) => item._id !== id),
            jobs: state.jobs.filter((item) => item._id !== id),
            currentJob: state.currentJob?._id === id ? null : state.currentJob,
          }));
        }
        const message = extractErrorMessage(err, 'Không thể cập nhật tin tuyển dụng');
        set({ error: message });
        throw new Error(message);
      } finally {
        adjustCounter('activeMutatingCount', -1);
      }
    },

    deleteJob: async (id) => {
      jobsMutationGen += 1;
      myJobsMutationGen += 1;

      set({ error: null });
      adjustCounter('activeMutatingCount', 1);

      try {
        await apiClient.delete(`/jobs/${id}`);

        jobsMutationGen += 1;
        myJobsMutationGen += 1;

        set((state) => ({
          myJobs: state.myJobs.filter((item) => item._id !== id),
          jobs: state.jobs.filter((item) => item._id !== id),
          currentJob: state.currentJob?._id === id ? null : state.currentJob,
        }));

        return { success: true };
      } catch (err) {
        if (err.response?.status === 404) {
          set((state) => ({
            myJobs: state.myJobs.filter((item) => item._id !== id),
            jobs: state.jobs.filter((item) => item._id !== id),
            currentJob: state.currentJob?._id === id ? null : state.currentJob,
          }));
          return { success: true };
        }

        if (!err.response || err.code === 'ECONNABORTED') {
          await Promise.allSettled([get().fetchMyJobs(), get().fetchJobs()]);
        }

        const message = extractErrorMessage(err, 'Không thể xóa tin tuyển dụng');
        set({ error: message });
        throw new Error(message);
      } finally {
        adjustCounter('activeMutatingCount', -1);
      }
    },
  };
});

export default useJobStore;