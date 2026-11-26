import {
  JOB_CATEGORIES,
  JOB_TYPES,
  normalizeJobCategory,
} from '../models/job.js';

const isValidString = (value) => typeof value === 'string';

export const validateJobInput = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    const errorMsg = 'Dữ liệu gửi lên không hợp lệ (request body phải là JSON object)';
    return res.status(400).json({
      success: false,
      message: errorMsg,
      errors: [errorMsg],
    });
  }
  const {
    title,
    companyName,
    description,
    requirements,
    benefits,
    salary,
    location,
    jobType,
    category,
    deadline,
    status,
  } = req.body;

  const errors = [];

  if (!isValidString(title) || title.trim().length < 5) {
    errors.push('Tiêu đề công việc phải là chuỗi và có ít nhất 5 ký tự');
  } else if (title.trim().length > 150) {
    errors.push('Tiêu đề công việc không được vượt quá 150 ký tự');
  }

  if (!isValidString(companyName) || companyName.trim().length < 2) {
    errors.push('Tên công ty phải là chuỗi và có ít nhất 2 ký tự');
  }

  if (!isValidString(description) || description.trim().length < 20) {
    errors.push('Mô tả công việc phải là chuỗi và có ít nhất 20 ký tự');
  }

  if (!isValidString(location) || location.trim().length < 2) {
    errors.push('Địa điểm làm việc phải là chuỗi và không được để trống');
  }

  if (requirements !== undefined && requirements !== null && !isValidString(requirements)) {
    errors.push('Yêu cầu công việc phải là chuỗi ký tự');
  }

  if (benefits !== undefined && benefits !== null && !isValidString(benefits)) {
    errors.push('Quyền lợi công việc phải là chuỗi ký tự');
  }

  if (salary !== undefined && salary !== null && !isValidString(salary)) {
    errors.push('Mức lương phải là chuỗi ký tự');
  }

  if (category !== undefined && category !== '') {
    if (!isValidString(category) || !JOB_CATEGORIES.includes(normalizeJobCategory(category))) {
      errors.push(`Ngành nghề không hợp lệ. Chỉ chấp nhận: ${JOB_CATEGORIES.join(', ')}`);
    }
  }

  if (jobType !== undefined && jobType !== '') {
    if (!isValidString(jobType) || !JOB_TYPES.includes(jobType)) {
      errors.push(`Loại hình công việc không hợp lệ. Chỉ chấp nhận: ${JOB_TYPES.join(', ')}`);
    }
  }

  if (status !== undefined && status !== '') {
    if (!isValidString(status) || !['active', 'closed'].includes(status)) {
      errors.push('Trạng thái công việc chỉ chấp nhận active hoặc closed');
    }
  }

  if (deadline !== undefined && deadline !== null && deadline !== '') {
    const parsedDate = new Date(deadline);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push('Hạn nộp hồ sơ không đúng định dạng ngày hợp lệ');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }
  return next();
};
export default validateJobInput;