import { useEffect } from 'react';
import useJobStore from '../../store/jobStore';
import JobFilterBar from '../../components/jobs/JobFilterBar';
import JobCard from '../../components/jobs/JobCard';

const JobListPage = () => {
  const { jobs, pagination, isLoading, error, fetchJobs } = useJobStore();

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Tìm việc làm sinh viên
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Khám phá Part-time, Thực tập và Remote phù hợp với lịch học của bạn
        </p>
      </div>

      <JobFilterBar />
      {!isLoading && !error && (
        <p className="text-sm text-gray-600 mb-4">
          Tìm thấy <strong className="text-gray-900">{pagination.total}</strong> tin tuyển dụng phù hợp
        </p>
      )}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-64 bg-gray-100 rounded-xl animate-pulse border border-gray-200"
            />
          ))}
        </div>
      )}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {!isLoading && !error && jobs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-700 font-medium mb-1">
            Chưa có tin tuyển dụng nào phù hợp
          </p>
          <p className="text-sm text-gray-500">
            Thay đổi từ khóa hoặc xóa bớt bộ lọc để xem nhiều công việc hơn.
          </p>
        </div>
      )}
      {!isLoading && !error && jobs.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3.5 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default JobListPage;