import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useJobStore from '../../store/jobStore';
import JobFormModal from '../../components/jobs/JobFormModal';

const JOB_TYPE_STYLES = {
  'Part-time': 'bg-blue-50 text-blue-700 border-blue-200',
  Internship: 'bg-purple-50 text-purple-700 border-purple-200',
  Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const EmployerJobDashboard = () => {
  const { jobs, isLoading, error, fetchJobs, deleteJob } = useJobStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleDeleteJob = async (job) => {
    const isConfirmed = window.confirm(
      `Chắc xóa tin"${job.title}" chứ?`
    );
    if (!isConfirmed) return;

    const result = await deleteJob(job._id);
    if (!result?.success && result?.message) {
      alert(result.message);
    }
  };
  const activeCount = jobs.filter((job) => job.status !== 'closed').length;
  const closedCount = jobs.filter((job) => job.status === 'closed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý tin tuyển dụng
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Đăng tin mới, cập nhật nội dung hoặc đóng các vị trí đã tuyển đủ ứng viên
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          + Đăng tin tuyển dụng
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Tổng số tin đã đăng</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Đang mở tuyển</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Đã ngừng tuyển</span>
          <p className="text-2xl font-bold text-gray-500 mt-1">{closedCount}</p>
        </div>
      </div>
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading && jobs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Đang tải danh sách tin tuyển dụng...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-gray-800 mb-1">
              Chưa có tin tuyển dụng nào
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Bắt đầu đăng vị trí đầu tiên để kết nối với ứng viên sinh viên
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Đăng tin ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3.5 px-4">Vị trí tuyển dụng</th>
                  <th className="py-3.5 px-4">Hình thức & Ngành</th>
                  <th className="py-3.5 px-4">Mức lương & Địa điểm</th>
                  <th className="py-3.5 px-4">Hạn nộp & Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {jobs.map((job) => {
                  const badgeStyle =
                    JOB_TYPE_STYLES[job.jobType] ||
                    'bg-gray-100 text-gray-700 border-gray-200';
                  const isClosed = job.status === 'closed';
                  const formattedDeadline = job.deadline
                    ? new Date(job.deadline).toLocaleDateString('vi-VN')
                    : 'Không giới hạn';

                  return (
                    <tr key={job._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                        >
                          {job.title}
                        </Link>
                        <span className="text-xs text-gray-500">{job.companyName}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-1 ${badgeStyle}`}
                        >
                          {job.jobType}
                        </span>
                        <div className="text-xs text-gray-600">{job.category}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-emerald-600">{job.salary}</div>
                        <div className="text-xs text-gray-500">{job.location}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs text-gray-700 mb-1">
                          Hạn: <span className="font-medium">{formattedDeadline}</span>
                        </div>
                        {isClosed ? (
                          <span className="inline-block text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            Ngừng tuyển
                          </span>
                        ) : (
                          <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Đang tuyển
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Xem
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(job)}
                            className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job)}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingJob}
      />
    </div>
  );
};
export default EmployerJobDashboard;