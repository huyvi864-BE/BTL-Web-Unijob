import { useState, useEffect } from 'react';
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

const DEFAULT_FORM = {
  title: '',
  companyName: '',
  category: 'Công nghệ thông tin',
  jobType: 'Part-time',
  salary: '',
  location: '',
  deadline: '',
  status: 'active',
  description: '',
  requirements: '',
};

const JobFormModal = ({ isOpen, onClose, initialData = null }) => {
  const { createJob, updateJob, isLoading } = useJobStore();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState('');

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormError('');
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          companyName: initialData.companyName || '',
          category: initialData.category || 'Công nghệ thông tin',
          jobType: initialData.jobType || 'Part-time',
          salary: initialData.salary || '',
          location: initialData.location || '',
          deadline: initialData.deadline
            ? new Date(initialData.deadline).toISOString().split('T')[0]
            : '',
          status: initialData.status || 'active',
          description: initialData.description || '',
          requirements: Array.isArray(initialData.requirements)
            ? initialData.requirements.join('\n')
            : initialData.requirements || '',
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      deadline: formData.deadline || undefined,
    };

    const result = isEditMode
      ? await updateJob(initialData._id, payload)
      : await createJob(payload);

    if (result.success) {
      onClose();
    } else {
      setFormError(result.message || 'Có lỗi, vui lòng kiểm tra lại thông tin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên công ty / Đơn vị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngành nghề <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình thức làm việc <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức lương <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="salary"
                required
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa điểm làm việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn nộp hồ sơ
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái tuyển dụng
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Đang tuyển (Hiển thị)</option>
                  <option value="closed">Ngừng tuyển (Đóng tin)</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả công việc <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yêu cầu ứng viên <span className="text-red-500">*</span>
            </label>
            <textarea
              name="requirements"
              rows={3}
              required
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {isLoading
                ? 'Đang lưu...'
                : isEditMode
                ? 'Lưu thay đổi'
                : 'Đăng tin ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default JobFormModal;