import mongoose from 'mongoose';
import Job from '../models/job.js';
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALLOWED_JOB_FIELDS = [
  'title',
  'companyName',
  'description',
  'requirements',
  'benefits',
  'salary',
  'location',
  'jobType',
  'category',
  'deadline',
  'status',
];

const pickAllowedFields = (body) => {
  const sanitized = {};
  for (const field of ALLOWED_JOB_FIELDS) {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  }
  return sanitized;
};

export const getAllJobs = async (req, res, next) => {
  try {
    const { keyword, category, location, jobType, page = 1, limit = 9 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const now = new Date();
    const andConditions = [
      { status: 'active' },
      {
        $or: [
          { deadline: { $exists: false } },
          { deadline: null },
          { deadline: { $gte: now } },
        ],
      },
    ];

    if (typeof keyword === 'string' && keyword.trim()) {
      const safeKeyword = escapeRegex(keyword.trim());
      andConditions.push({
        $or: [
          { title: { $regex: safeKeyword, $options: 'i' } },
          { companyName: { $regex: safeKeyword, $options: 'i' } },
        ],
      });
    }

    if (typeof category === 'string' && category.trim()) {
      andConditions.push({ category: category.trim() });
    }

    if (typeof jobType === 'string' && jobType.trim()) {
      andConditions.push({ jobType: jobType.trim() });
    }

    if (typeof location === 'string' && location.trim()) {
      const safeLocation = escapeRegex(location.trim());
      andConditions.push({
        location: { $regex: safeLocation, $options: 'i' },
      });
    }

    const query = { $and: andConditions };

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyJobs = async (req, res, next) => {
  try {
    const employerId = req.user?._id || req.user?.id || req.query.employerId;

    if (!employerId || !mongoose.Types.ObjectId.isValid(employerId)) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập tài khoản nhà tuyển dụng hợp lệ',
      });
    }

    const jobs = await Job.find({ employer: employerId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    return next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã công việc (ID) không hợp lệ',
      });
    }

    const job = await Job.findById(id).populate('employer', 'fullName email companyName');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    return next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const jobData = pickAllowedFields(req.body);

    if (!jobData.deadline) {
      jobData.deadline = null;
    }

    const authenticatedUserId = req.user?._id || req.user?.id;
    if (authenticatedUserId) {
      jobData.employer = authenticatedUserId;
    } else if (req.body.employer && mongoose.Types.ObjectId.isValid(req.body.employer)) {
      jobData.employer = req.body.employer;
    }

    const newJob = await Job.create(jobData);

    return res.status(201).json({
      success: true,
      message: 'Đăng tin tuyển dụng thành công',
      data: newJob,
    });
  } catch (error) {
    return next(error);
  }
};
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã công việc (ID) không hợp lệ',
      });
    }

    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng để cập nhật',
      });
    }

    const authenticatedUserId = req.user?._id || req.user?.id;
    if (
      authenticatedUserId &&
      existingJob.employer &&
      existingJob.employer.toString() !== authenticatedUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tin tuyển dụng của nhà tuyển dụng khác',
      });
    }

    const updateData = pickAllowedFields(req.body);
    if (updateData.deadline === '') {
      updateData.deadline = null;
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tin tuyển dụng thành công',
      data: updatedJob,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã công việc (ID) không hợp lệ',
      });
    }

    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng để xóa',
      });
    }

    const authenticatedUserId = req.user?._id || req.user?.id;
    if (
      authenticatedUserId &&
      existingJob.employer &&
      existingJob.employer.toString() !== authenticatedUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin tuyển dụng của nhà tuyển dụng khác',
      });
    }

    await Job.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa tin tuyển dụng thành công',
    });
  } catch (error) {
    return next(error);
  }
};