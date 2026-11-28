import { useEffect } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { useApplicationStore } from '../store/useApplicationStore';

export default function StudentApplicationsPage() {
  const { myApplications, loading, fetchMyApplications, deleteApplication } =
    useApplicationStore();

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  if (loading) return <p className="p-6 text-sm">Đang tải danh sách ứng tuyển...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Việc làm đã ứng tuyển</h1>

      {myApplications.length === 0 ? (
        <p className="text-sm text-gray-500 border rounded p-6 bg-white">
          Bạn chưa ứng tuyển công việc nào.
        </p>
      ) : (
        myApplications.map((app) => (
          <div
            key={app._id}
            className="border rounded-lg p-4 flex items-center justify-between gap-4 bg-white"
          >
            <div>
              <h2 className="font-semibold">{app.job?.title || 'Tin tuyển dụng'}</h2>
              <p className="text-xs text-gray-500">
                {app.job?.company || 'Doanh nghiệp'} • Trạng thái: <strong>{app.status}</strong>
              </p>
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

            {app.status === 'pending' && (
              <button
                onClick={() => deleteApplication(app._id, 'student')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-red-500 text-red-600 rounded"
              >
                <Trash2 size={14} /> Rút đơn
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}