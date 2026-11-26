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
const getAuthenticatedEmployerId = (req) => {
  const rawId = req.user?._id || req.user?.id;
  if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
    return null;
  }
  return new mongoose.Types.ObjectId(rawId);
};
const getStartOfTodayUTC = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start;
};
const expandCategoryValues = (category) => {
  const canonical = normalizeJobCategory(category);
  const aliases = Object.entries(LEGACY_CATEGORY_MAP)
    .filter(([, mapped]) => mapped === canonical)
    .map(([legacy]) => legacy);
  return Array.from(new Set([canonical, ...aliases]));
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
export const claimLegacyJobs = async (req, res, next) => {
  try {
    const employerId = getAuthenticatedEmployerId(req);
    if (!employerId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để chuyển quyền quản lý tin tuyển dụng cũ',
      });
    }

    const { jobIds } = req.body || {};
    const filter = {
      $or: [
        { employer: new mongoose.Types.ObjectId(LEGACY_TEMP_EMPLOYER_ID) },
        { employer: { $exists: false } },
        { employer: null },
      ],
    };

    if (Array.isArray(jobIds) && jobIds.length > 0) {
      const validIds = jobIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      filter._id = { $in: validIds };
    }

    const result = await Job.updateMany(filter, {
      $set: { employer: employerId },
    });

    return res.status(200).json({
      success: true,
      message: `Đã chuyển quyền quản lý ${result.modifiedCount} tin tuyển dụng cũ`,
      modifiedCount: result.modifiedCount,
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

    const job = await Job.findById(id)
      .select('-idempotencyKey')
      .populate('employer', 'fullName companyName')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...job,
        category: normalizeJobCategory(job.category),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const authenticatedUserId = getAuthenticatedEmployerId(req);
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để đăng tin tuyển dụng',
      });
    }
    const idempotencyKey = req.get('Idempotency-Key')?.trim() || undefined;
    if (idempotencyKey) {
      const existingJob = await Job.findOne({
        employer: authenticatedUserId,
        idempotencyKey,
      }).select('-idempotencyKey');

      if (existingJob) {
        return res.status(200).json({
          success: true,
          message: 'Tin tuyển dụng đã được tạo trước đó',
          data: existingJob,
        });
      }
    }

    const jobData = pickAllowedFields(req.body);
    if (!jobData.deadline) {
      jobData.deadline = null;
    }
    if (jobData.category) {
      jobData.category = normalizeJobCategory(jobData.category);
    }

    jobData.employer = authenticatedUserId;
    if (idempotencyKey) {
      jobData.idempotencyKey = idempotencyKey;
    }

    const newJob = await Job.create(jobData);
    const sanitizedJob = newJob.toObject();
    delete sanitizedJob.idempotencyKey;

    return res.status(201).json({
      success: true,
      message: 'Đăng tin tuyển dụng thành công',
      data: sanitizedJob,
    });
  } catch (error) {
    if (error.code === 11000 && req.get('Idempotency-Key')) {
      const authenticatedUserId = getAuthenticatedEmployerId(req);
      const existing = await Job.findOne({
        employer: authenticatedUserId,
        idempotencyKey: req.get('Idempotency-Key').trim(),
      }).select('-idempotencyKey');

      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Tin tuyển dụng đã được tạo trước đó',
          data: existing,
        });
      }
    }
    return next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const authenticatedUserId = getAuthenticatedEmployerId(req);
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để chỉnh sửa tin tuyển dụng',
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã công việc (ID) không hợp lệ',
      });
    }

    const updateData = pickAllowedFields(req.body);
    if (updateData.deadline === '') {
      updateData.deadline = null;
    }
    if (updateData.category) {
      updateData.category = normalizeJobCategory(updateData.category);
    }
    const hasVersion =
      req.body.version !== undefined &&
      req.body.version !== null &&
      !Number.isNaN(Number(req.body.version));

    const filter = {
      _id: id,
      employer: authenticatedUserId,
      ...(hasVersion ? { __v: Number(req.body.version) } : {}),
    };

    const updatedJob = await Job.findOneAndUpdate(
      filter,
      {
        $set: updateData,
        $inc: { __v: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-idempotencyKey');

    if (!updatedJob) {
      const currentDoc = await Job.findById(id).select('employer __v').lean();
      if (!currentDoc) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin tuyển dụng để cập nhật',
        });
      }
      if (
        !currentDoc.employer ||
        currentDoc.employer.toString() !== authenticatedUserId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa tin tuyển dụng này',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Dữ liệu tin tuyển dụng đã được cập nhật ở phiên khác. Vui lòng tải lại trang trước khi lưu',
      });
    }
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
    const authenticatedUserId = getAuthenticatedEmployerId(req);
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để xóa tin tuyển dụng',
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Mã công việc (ID) không hợp lệ',
      });
    }
    const deletedJob = await Job.findOneAndDelete({
      _id: id,
      employer: authenticatedUserId,
    });
    if (!deletedJob) {
      const currentDoc = await Job.findById(id).select('employer').lean();
      if (!currentDoc) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin tuyển dụng để xóa',
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin tuyển dụng này',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Đã xóa tin tuyển dụng thành công',
    });
  } catch (error) {
    return next(error);
  }
};