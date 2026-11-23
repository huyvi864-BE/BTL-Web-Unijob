import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import useJobStore from '../../store/jobStore';

const JobDetailPage = () => {
  const { id } = useParams();
  const { currentJob, isLoading, error, fetchJobById } = useJobStore();
  const [applyNotice, setApplyNotice] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-gray-500">
        Đang tải thông tin chi tiết việc làm...
      </div>
    );
  }

  if (error || !currentJob) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-base font-semibold text-red-600 mb-3">
          {error || 'Không tìm thấy tin tuyển dụng'}
        </p>
        <Link
          to="/jobs"
          className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          &larr; Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  const isExpired = Boolean(currentJob.deadline && new Date(currentJob.deadline) < new Date());
  const isClosed = currentJob.status === 'closed' || isExpired;

  const handleApplyClick = () => {
    if (isClosed) return;
    setApplyNotice(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-blue-600">
          &larr; Quay lại danh sách việc làm
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {currentJob.jobType}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {currentJob.category}
              </span>
              {isClosed && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  {isExpired && currentJob.status === 'active'
                    ? 'Đã hết hạn nộp hồ sơ'
                    : 'Ngừng nhận hồ sơ'}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{currentJob.title}</h1>
            <p className="text-base font-medium text-gray-700 mt-1">{currentJob.companyName}</p>
          </div>

          <div className="sm:w-52 shrink-0">
            <button
              type="button"
              disabled={isClosed}
              onClick={handleApplyClick}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isExpired && currentJob.status === 'active'
                ? 'Đã hết hạn nộp'
                : currentJob.status === 'closed'
                ? 'Đã ngừng tuyển'
                : 'Ứng tuyển ngay'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Mức lương</span>
            <span className="font-semibold text-emerald-700">{currentJob.salary || 'Thỏa thuận'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Địa điểm làm việc</span>
            <span className="font-semibold text-gray-900">{currentJob.location}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Hạn nộp hồ sơ</span>
            <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
              {currentJob.deadline
                ? new Date(currentJob.deadline).toLocaleDateString('vi-VN')
                : 'Không giới hạn'}
            </span>
          </div>
        </div>

        {applyNotice && !isClosed && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Mô tả công việc</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {currentJob.description}
          </p>
        </section>

        {currentJob.requirements && (
          <section className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Yêu cầu ứng viên</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {currentJob.requirements}
            </p>
          </section>
        )}

        {currentJob.benefits && (
          <section className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Quyền lợi được hưởng</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {currentJob.benefits}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default JobDetailPage;