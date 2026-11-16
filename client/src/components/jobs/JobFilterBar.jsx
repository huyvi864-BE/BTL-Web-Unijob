import useJobStore from '../../store/jobStore';

const CATEGORIES = [
  'Công nghệ thông tin',
  'Marketing & Truyền thông',
  'Kinh doanh & Bán hàng',
  'Giáo dục & Đào tạo',
  'Thiết kế & Sáng tạo',
  'Dịch vụ & F&B',
  'Khác',
];

const JOB_TYPES = [
  { value: 'Part-time', label: 'Bán thời gian (Part-time)' },
  { value: 'Internship', label: 'Thực tập (Internship)' },
  { value: 'Remote', label: 'Làm từ xa (Remote)' },
];

const JobFilterBar = () => {
  const { filters, setFilters, resetFilters, fetchJobs } = useJobStore();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleSelectChange = (field, value) => {
    setFilters({ [field]: value });
    fetchJobs(1);
  };

  const handleReset = () => {
    resetFilters();
    fetchJobs(1);
  };

  const hasActiveFilters =
    filters.keyword || filters.category || filters.jobType || filters.location;

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm mb-6"
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => setFilters({ keyword: e.target.value })}
          placeholder="Tìm theo tên công việc hoặc tên công ty..."
          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Tìm kiếm
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={filters.category}
          onChange={(e) => handleSelectChange('category', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả ngành nghề</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={filters.jobType}
          onChange={(e) => handleSelectChange('jobType', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả hình thức</option>
          {JOB_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters({ location: e.target.value })}
          placeholder="Khu vực (VD: Hà Nội, Cầu Giấy...)"
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Xóa bộ lọc
        </button>
      </div>
    </form>
  );
};

export default JobFilterBar;