import useJobStore from '../../store/jobStore';

export const JOB_CATEGORIES = [
  'IT & Phần mềm',
  'Marketing & Truyền thông',
  'F&B & Dịch vụ',
  'Gia sư & Đào tạo',
  'Bán hàng & CSKH',
  'Khác',
];

export const JOB_TYPES = [
  'Part-time',
  'Full-time',
  'Internship',
  'Freelance',
  'Remote',
];

const JobFilterBar = ({ filters: propFilters, onFilterChange, onReset }) => {
  const store = useJobStore();
  const filters = propFilters || store.filters;

  const handleFieldChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ [field]: value });
    } else {
      store.setFilters({ [field]: value });
      store.fetchJobs({ [field]: value, page: 1 });
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      store.resetFilters();
      store.fetchJobs({
        keyword: '',
        category: '',
        location: '',
        jobType: '',
        page: 1,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onFilterChange) {
      store.fetchJobs({ page: 1 });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={(e) => handleFieldChange('keyword', e.target.value)}
            placeholder="Tìm vị trí, tên công ty..."
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.category || ''}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả ngành nghề</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={filters.jobType || ''}
            onChange={(e) => handleFieldChange('jobType', e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Loại hình</option>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="Hà Nội..."
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-1 flex">
          <button
            type="button"
            onClick={handleReset}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            title="Xóa bộ lọc"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </form>
  );
};
export default JobFilterBar;