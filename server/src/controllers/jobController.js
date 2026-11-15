import Job from '../models/Job.js';

const TEMP_EMPLOYER_ID = '650000000000000000000001';

export const getAllJobs = async (req, res, next) => {
  try {
    const { keyword, category, location, jobType, page = 1, limit = 9 } = req.query;
    const query = { status: 'active' };

    if (keyword && keyword.trim()) {
      query.$or = [
        { title: { $regex: keyword.trim(), $options: 'i' } },
        { companyName: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (jobType) query.jobType = jobType;
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyJobs = async (req, res, next) => {
  try {
    const employerId = req.user?._id || req.query.employerId || TEMP_EMPLOYER_ID;
    const jobs = await Job.find({ employer: employerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};