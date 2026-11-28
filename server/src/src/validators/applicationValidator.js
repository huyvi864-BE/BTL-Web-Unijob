export const validateCreateApplication = (req, res, next) => {
  const { jobId, cvUrl } = req.body;

  if (!jobId) {
    return res.status(400).json({ message: 'Thiếu mã công việc (jobId)' });
  }

  if (!req.file && (!cvUrl || !cvUrl.trim())) {
    return res.status(400).json({
      message: 'Vui lòng tải file CV hoặc nhập đường dẫn CV (cvUrl)',
    });
  }

  next();
};

export const validateUpdateStatus = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái đơn ứng tuyển không hợp lệ' });
  }

  next();
};