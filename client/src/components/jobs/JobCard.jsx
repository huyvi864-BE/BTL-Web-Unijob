import { Link } from 'react-router';

const JOB_TYPE_STYLES = {
  'Part-time': 'bg-blue-50 text-blue-700 border-blue-200',
  Internship: 'bg-purple-50 text-purple-700 border-purple-200',
  Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const JobCard = ({ job }) => {
  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString('vi-VN')
    : 'Không giới hạn';

  const badgeStyle =
    JOB_TYPE_STYLES[job.jobType] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyle}`}
          >
            {job.jobType}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md truncate max-w-[160px]">
            {job.category}
          </span>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="block text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1"
        >
          {job.title}
        </Link>
        <p className="text-sm font-medium text-gray-600 mb-4">
          {job.companyName}
        </p>
        <div className="space-y-2 text-sm text-gray-600 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-600">Mức lương:</span>
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Địa điểm:</span>
            <span className="truncate">{job.location}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Hạn nộp: <strong className="text-gray-700">{formattedDeadline}</strong>
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Xem chi tiết &rarr;
        </Link>
      </div>
    </div>
  );
};

export default JobCard;