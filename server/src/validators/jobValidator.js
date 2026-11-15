export const validateJobInput = (req, res, next) => {
  const {
    title,
    companyName,
    category,
    jobType,
    salary,
    location,
    description,
    requirements,
    deadline,
  } = req.body;

  const errors = [];

  if (!title || title.trim().length < 5) {
    errors.push('Tiêu đề công việc phải có ít nhất 5 ký tự');
  }
  if (!companyName || !companyName.trim()) {
    errors.push('Vui lòng nhập tên công ty hoặc đơn vị tuyển dụng');
  }
  if (!category) {
    errors.push('Vui lòng chọn ngành nghề');
  }
  if (!['Part-time', 'Internship', 'Remote'].includes(jobType)) {
    errors.push('Hình thức làm việc không hợp lệ');
  }
  if (!salary || !salary.trim()) {
    errors.push('Vui lòng nhập mức lương');
  }
  if (!location || !location.trim()) {
    errors.push('Vui lòng nhập địa điểm làm việc');
  }
  if (!description || description.trim().length < 15) {
    errors.push('Mô tả công việc phải có ít nhất 15 ký tự');
  }
  if (!requirements || !requirements.trim()) {
    errors.push('Vui lòng nhập yêu cầu ứng viên');
  }
  if (!deadline || Number.isNaN(Date.parse(deadline))) {
    errors.push('Hạn nộp hồ sơ không hợp lệ');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors,
    });
  }

  next();
};