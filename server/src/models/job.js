import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề công việc là bắt buộc'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Tên doanh nghiệp/cửa hàng là bắt buộc'],
      trim: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'IT & Phần mềm',
        'Marketing & Truyền thông',
        'F&B & Dịch vụ',
        'Gia sư & Đào tạo',
        'Bán hàng & CSKH',
        'Khác',
      ],
      index: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ['Part-time', 'Internship', 'Remote'],
      default: 'Part-time',
    },
    salary: {
      type: String,
      required: [true, 'Mức lương là bắt buộc'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Địa điểm làm việc là bắt buộc'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả công việc là bắt buộc'],
    },
    requirements: {
      type: String,
      required: [true, 'Yêu cầu ứng viên là bắt buộc'],
    },
    deadline: {
      type: Date,
      required: [true, 'Hạn nộp hồ sơ là bắt buộc'],
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', companyName: 'text', location: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job;