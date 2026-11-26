import mongoose from 'mongoose';

export const JOB_CATEGORIES = [
  'IT & Phần mềm',
  'Marketing & Truyền thông',
  'F&B & Dịch vụ',
  'Gia sư & Đào tạo',
  'Bán hàng & CSKH',
  'Khác',
];

export const LEGACY_CATEGORY_MAP = {
  'Công nghệ thông tin': 'IT & Phần mềm',
  'Kinh doanh & Bán hàng': 'Bán hàng & CSKH',
  'Giáo dục & Đào tạo': 'Gia sư & Đào tạo',
  'Dịch vụ & F&B': 'F&B & Dịch vụ',
  'Thiết kế & Sáng tạo': 'Khác',
};

export const normalizeJobCategory = (category) => {
  if (typeof category !== 'string') return category;
  const trimmed = category.trim();
  return LEGACY_CATEGORY_MAP[trimmed] || trimmed;
};

export const JOB_TYPES = [
  'Part-time',
  'Full-time',
  'Internship',
  'Freelance',
  'Remote',
];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề công việc'],
      trim: true,
      minlength: [5, 'Tiêu đề công việc phải có ít nhất 5 ký tự'],
      maxlength: [150, 'Tiêu đề công việc không được vượt quá 150 ký tự'],
    },
    companyName: {
      type: String,
      required: [true, 'Vui lòng nhập tên công ty hoặc cửa hàng'],
      trim: true,
      maxlength: [150, 'Tên công ty không được vượt quá 150 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả công việc'],
      trim: true,
      minlength: [20, 'Mô tả công việc phải có ít nhất 20 ký tự'],
    },
    requirements: {
      type: String,
      trim: true,
      default: '',
    },
    benefits: {
      type: String,
      trim: true,
      default: '',
    },
    salary: {
      type: String,
      trim: true,
      default: 'Thỏa thuận',
    },
    location: {
      type: String,
      required: [true, 'Vui lòng nhập địa điểm làm việc'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: {
        values: JOB_TYPES,
        message: 'Loại hình công việc không hợp lệ',
      },
      default: 'Part-time',
    },
    category: {
      type: String,
      enum: {
        values: JOB_CATEGORIES,
        message: 'Ngành nghề không hợp lệ',
      },
      default: 'Khác',
    },
    deadline: {
      type: Date,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  idempotencyKey: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);
jobSchema.pre('validate', function () {
  if (this.category) {
    this.category = normalizeJobCategory(this.category);
  }
});

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ status: 1, deadline: 1, createdAt: -1 });
jobSchema.index({ employer: 1, createdAt: -1 });
jobSchema.index({ category: 1, jobType: 1 });
jobSchema.index({ title: 'text', companyName: 'text', description: 'text' });
jobSchema.index(
  { employer: 1, idempotencyKey: 1 },
  { unique: true, sparse: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;