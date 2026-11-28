import { useEffect, useState } from 'react';
import { Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { useApplicationStore } from '../store/useApplicationStore';

export default function ApplicantReviewPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const {
    employerApplications,
    stats,
    loading,
    fetchEmployerApplications,
    updateStatus,
    deleteApplication,
  } = useApplicationStore();

  useEffect(() => {
    fetchEmployerApplications(statusFilter === 'all' ? {} : { status: statusFilter });
  }, [statusFilter, fetchEmployerApplications]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={20} /> Duyệt ứng viên & Thống kê
        </h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">pending</option>
          <option value="reviewing">reviewing</option>
          <option value="accepted">accepted</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="border rounded-lg p-3 bg-white">
          <p className="text-xs text-gray-500">Tổng đơn nhận</p>
          <p className="text-lg font-bold">{stats.total}</p>
        </div>
        <div className="border rounded-lg p-3 bg-white">
          <p className="text-xs text-gray-500">Chờ duyệt</p>
          <p className="text-lg font-bold">{stats.pending}</p>
        </div>
        <div className="border rounded-lg p-3 bg-white">
          <p className="text-xs text-gray-500">Đang xem xét</p>
          <p className="text-lg font-bold">{stats.reviewing}</p>
        </div>
        <div className="border rounded-lg p-3 bg-white">
          <p className="text-xs text-gray-500">Đã nhận</p>
          <p className="text-lg font-bold">{stats.accepted}</p>
        </div>
        <div className="border rounded-lg p-3 bg-white">
          <p className="text-xs text-gray-500">Từ chối</p>
          <p className="text-lg font-bold">{stats.rejected}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm">Đang tải danh sách ứng viên...</p>
      ) : (
        <div className="space-y-3">
          {employerApplications.map((app) => (
            <div
              key={app._id}
              className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 bg-white"
            >
              <div>
                <p className="font-semibold">
                  {app.student?.fullName || app.student?.name || 'Sinh viên'} —{' '}
                  {app.job?.title || 'Tin tuyển dụng'}
                </p>
                <p className="text-xs text-gray-500">{app.student?.email}</p>
                {app.cvUrl && (
                  <a
                    href={app.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs underline mt-1"
                  >
                    Xem CV <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app._id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="pending">pending</option>
                  <option value="reviewing">reviewing</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                </select>

                <button
                  onClick={() => deleteApplication(app._id, 'employer')}
                  className="p-2 border border-red-500 text-red-600 rounded"
                  title="Xóa đơn"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}