import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/job.js';
import cloudinary from '../config/cloudinary.js';

const getUserId = (req) => req.user?._id || req.user?.id;

const uploadCvBuffer = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'unijob/cvs', resource_type: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(file.buffer);
  });

export const createApplication = async (req, res, next) => {
  try {
    const studentId = getUserId(req);
    const { jobId, cvUrl, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }

    const existed = await Application.findOne({ job: jobId, student: studentId });
    if (existed) {
      return res.status(409).json({ message: 'Bạn đã ứng tuyển công việc này rồi' });
    }

    let finalCvUrl = cvUrl?.trim() || '';
    let cvPublicId = '';

    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      const uploaded = await uploadCvBuffer(req.file);
      finalCvUrl = uploaded.secure_url;
      cvPublicId = uploaded.public_id;
    }

    const created = await Application.create({
      job: jobId,
      student: studentId,
      employer: job.employer || job.postedBy || job.createdBy,
      cvUrl: finalCvUrl,
      cvPublicId,
      coverLetter: coverLetter?.trim() || '',
    });

    return res.status(201).json({
      message: 'Nộp hồ sơ ứng tuyển thành công',
      data: created,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Bạn đã ứng tuyển công việc này rồi' });
    }
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const studentId = getUserId(req);
    const items = await Application.find({ student: studentId })
      .populate('job', 'title company location jobType')
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: items });
  } catch (error) {
    next(error);
  }
};

export const getEmployerApplications = async (req, res, next) => {
  try {
    const employerId = getUserId(req);
    const filter = { employer: employerId };

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.jobId) {
      filter.job = req.query.jobId;
    }

    const applications = await Application.find(filter)
      .populate('student', 'fullName name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    const grouped = await Application.aggregate([
      { $match: { employer: new mongoose.Types.ObjectId(employerId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = {
      total: 0,
      pending: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0,
    };

    for (const row of grouped) {
      stats[row._id] = row.count;
      stats.total += row.count;
    }

    return res.status(200).json({ data: applications, stats });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const employerId = getUserId(req);
    const updated = await Application.findOneAndUpdate(
      { _id: req.params.id, employer: employerId },
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền cập nhật',
      });
    }

    return res.status(200).json({
      message: 'Đã cập nhật trạng thái đơn',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const userId = getUserId(req).toString();
    const doc = await Application.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển' });
    }

    const allowed =
      doc.student.toString() === userId || doc.employer.toString() === userId;

    if (!allowed) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đơn này' });
    }

    if (doc.cvPublicId && process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(doc.cvPublicId);
    }

    await doc.deleteOne();
    return res.status(200).json({ message: 'Đã xóa đơn ứng tuyển' });
  } catch (error) {
    next(error);
  }
};