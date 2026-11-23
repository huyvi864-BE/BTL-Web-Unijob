import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useJobStore from '../../store/jobStore';
import JobFormModal from '../../components/jobs/JobFormModal';

const EmployerJobDashboard = () => {
  const { myJobs, isLoading, error, fetchMyJobs, deleteJob } = useJobStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = async (job) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa tin "${job.title}" không?`);
    if (!confirmed) return;

    try {
      await deleteJob(job._id);
    } catch (err) {
      alert(err.message || 'Không thể xóa tin tuyển dụng');
    }
  };

  const isJobExpired = (job) => Boolean(job.deadline && new Date(job.deadline) < new Date());

  const activeCount = myJobs.filter((j) => j.status === 'active' && !isJobExpired(j)).length;
  const closedOrExpiredCount = myJobs.length - activeCount;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
    
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>
          <p className="text-sm text-gray-600 mt-1">
            Đăng tin mới, cập nhật nội dung và theo dõi trạng thái các vị trí đang tuyển
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          + Đăng tin tuyển dụng mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Tổng tin đã đăng</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{myJobs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Đang hiển thị</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Đã đóng / Hết hạn</span>
          <p className="text-2xl font-bold text-gray-600 mt-1">{closedOrExpiredCount}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchMyJobs}
            className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading && myJobs.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Đang tải danh sách tin tuyển dụng...
          </div>
        ) : myJobs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-gray-800 mb-1">
              Bạn chưa đăng tin tuyển dụng nào
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Bắt đầu đăng tin để tiếp cận User
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Đăng tin đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3.5 px-4">Vị trí tuyển dụng</th>
                  <th className="py-3.5 px-4">Ngành & Loại hình</th>
                  <th className="py-3.5 px-4">Hạn nộp</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {myJobs.map((job) => {
                  const expired = isJobExpired(job);
                  const isClosed = job.status === 'closed' || expired;

                  return (
                    <tr key={job._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 block"
                        >
                          {job.title}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {job.companyName} • {job.location}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        <div className="font-medium text-gray-800">{job.category}</div>
                        <div>{job.jobType} • {job.salary}</div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString('vi-VN')
                          : 'Không giới hạn'}
                      </td>
                      <td className="py-4 px-4">
                        {isClosed ? (
                          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                            {expired && job.status === 'active' ? 'Hết hạn nộp' : 'Đã đóng'}
                          </span>
                        ) : (
                          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Đang tuyển
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(job)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
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
        onClose={() => setIsModalOpen(false)}
        editingJob={editingJob}
      />
    </div>
  );
};

export default EmployerJobDashboard;