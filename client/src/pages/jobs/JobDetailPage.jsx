import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useJobStore from '../../store/jobStore';

const JOB_TYPE_STYLES = {
  'Part-time': 'bg-blue-50 text-blue-700 border-blue-200',
  Internship: 'bg-purple-50 text-purple-700 border-purple-200',
  Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}; 
const JobDetailPage = () => {
  const { id } = useParams();
  const { currentJob, isLoading, error, fetchJobById } = useJobStore();
  const [appliedNotice, setAppliedNotice] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-44 bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
      </div>
    );
  }
  if (error || !currentJob) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl inline-block mb-4">
          <p className="font-semibold mb-1">Không thể hiển thị tin tuyển dụng</p>
          <p className="text-sm">{error || 'Tin tuyển dụng không tồn tại hoặc đã bị xóa.'}</p>
        </div>
        <div>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            &larr; Quay lại danh sách việc làm
          </Link>
        </div>
      </div>
    );
  }

  const formattedDeadline = currentJob.deadline
    ? new Date(currentJob.deadline).toLocaleDateString('vi-VN')
    : 'Không giới hạn';

  const badgeStyle =
    JOB_TYPE_STYLES[currentJob.jobType] || 'bg-gray-100 text-gray-700 border-gray-200';

  const isClosed = currentJob.status === 'closed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          &larr; Quay lại danh sách việc làm
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${badgeStyle}`}
          >
            {currentJob.jobType}
          </span>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
            {currentJob.category}
          </span>
          {isClosed && (
            <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Đã ngừng tuyển
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {currentJob.title}
        </h1>
        <p className="text-base font-semibold text-gray-700 mb-5">
          {currentJob.companyName}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-sm">
          <div>
            <span className="block text-gray-500 text-xs mb-0.5">Mức lương</span>
            <span className="font-bold text-emerald-600 text-base">
              {currentJob.salary}
            </span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-0.5">Địa điểm làm việc</span>
            <span className="font-semibold text-gray-800">{currentJob.location}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-0.5">Hạn nộp hồ sơ</span>
            <span className="font-semibold text-gray-800">{formattedDeadline}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
              Mô tả công việc
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {currentJob.description}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
              Yêu cầu ứng viên
            </h2>
            {Array.isArray(currentJob.requirements) ? (
              <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 leading-relaxed">
                {currentJob.requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {currentJob.requirements}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Thông tin chung
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 mb-6">
              <li className="flex justify-between gap-2">
                <span className="text-gray-500">Hình thức:</span>
                <span className="font-medium text-gray-900">{currentJob.jobType}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-gray-500">Ngành nghề:</span>
                <span className="font-medium text-gray-900 text-right">{currentJob.category}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`font-semibold ${isClosed ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isClosed ? 'Đã đóng' : 'Đang tuyển'}
                </span>
              </li>
            </ul>

            <button
              type="button"
              disabled={isClosed}
              onClick={() => setAppliedNotice(true)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {isClosed ? 'Tin đã ngừng nhận hồ sơ' : 'Ứng tuyển ngay'}
            </button>

            {appliedNotice && !isClosed && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                Tv3
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default JobDetailPage;