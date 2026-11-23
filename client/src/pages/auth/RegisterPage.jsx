import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, GraduationCap, Mail, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { registerAccount } from '../../api/authUserApi.js';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons.jsx';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import AuthCarousel from '../../components/auth/AuthCarousel.jsx';
import findJobs from '../../assets/register/find-jobs.png';
import trackApplications from '../../assets/register/track-applications.png';
import startCareer from '../../assets/register/start-career.png';
import styles from './RegisterPage.module.css';

const slides = [
  {
    image: findJobs,
    description: 'Tìm kiếm công việc mơ ước và kết nối doanh nghiệp cùng UniJob.',
  },
  {
    image: trackApplications,
    description: 'Nộp hồ sơ trực tuyến và theo dõi trạng thái ứng tuyển dễ dàng.',
  },
  {
    image: startCareer,
    description: 'Đón nhận cơ hội và tự tin bắt đầu hành trình sự nghiệp mới.',
  },
];

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={styles.srOnly}>{label}</label>
      <div className={styles.field}>{children}</div>
      {error && (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
      defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'student', acceptTerms: false },
  });

  async function submit({ name, email, password, role }) {
    setMessage('');
    try {
      await registerAccount({ name: name.trim(), email: email.trim(), password, role });
      toast.success('Tạo tài khoản thành công. Hãy đăng nhập.');
      navigate('/login', { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.error?.message || 'Không thể đăng ký. Hãy thử lại.');
    }
  }

  return (
     <AuthLayout visual={<AuthCarousel slides={slides} />} showVisualOnMobile variant="register">
      <h1 id="register-title" className={styles.title}>Đăng ký tài khoản!</h1>
      <p className={styles.intro}>
        Khám phá cơ hội và xây dựng sự nghiệp của bạn cùng UniJob. Hoàn toàn miễn phí.
      </p>

      <form className={styles.form} noValidate onSubmit={handleSubmit(submit)}>
        <Field id="register-name" label="Họ và tên" error={errors.name}>
          <UserRound size={18} aria-hidden="true" />
          <input
            id="register-name" placeholder="Họ và tên" autoComplete="name" maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            {...register('name', {
              required: 'Hãy nhập họ và tên.',
              validate: (value) => value.trim().length >= 2 || 'Họ và tên cần ít nhất 2 ký tự.',
            })}
          />
        </Field>

        <Field id="register-email" label="Email" error={errors.email}>
          <Mail size={18} aria-hidden="true" />
          <input
            id="register-email" type="email" placeholder="Email" autoComplete="email" maxLength={254}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            {...register('email', {
              required: 'Hãy nhập email.',
              validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Hãy nhập email hợp lệ.',
            })}
          />
        </Field>

        <Field id="register-password" label="Mật khẩu" error={errors.password}>
          <input
            id="register-password" type={showPassword ? 'text' : 'password'}
            placeholder="Mật khẩu" autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'register-password-error' : undefined}
            {...register('password', {
              required: 'Hãy nhập mật khẩu.',
              minLength: { value: 8, message: 'Mật khẩu cần ít nhất 8 ký tự.' },
              validate: (value) => new TextEncoder().encode(value).length <= 72 || 'Mật khẩu dài tối đa 72 byte UTF-8.',
            })}
          />
          <button type="button" className={styles.eye}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-controls="register-password" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          </button>
        </Field>

        <Field id="register-confirm" label="Nhập lại mật khẩu" error={errors.confirmPassword}>
          <input
            id="register-confirm" type={showConfirmation ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu" autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined}
            {...register('confirmPassword', {
              required: 'Hãy nhập lại mật khẩu.',
              validate: (value) => value === getValues('password') || 'Hai mật khẩu chưa khớp.',
            })}
          />
          <button type="button" className={styles.eye}
            aria-label={showConfirmation ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'}
            aria-controls="register-confirm" onClick={() => setShowConfirmation((value) => !value)}>
            {showConfirmation ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          </button>
        </Field>

        <fieldset className={styles.roleGroup}>
          <legend>Bạn là?</legend>
          <div className={styles.roleOptions}>
            <label className={styles.roleOption}>
              <input type="radio" value="student" {...register('role')} />
              <span><GraduationCap size={19} aria-hidden="true" />Sinh viên</span>
            </label>
            <label className={styles.roleOption}>
              <input type="radio" value="employer" {...register('role')} />
              <span><BriefcaseBusiness size={17} aria-hidden="true" />Nhà tuyển dụng</span>
            </label>
          </div>
        </fieldset>
        <div>
          <label className={styles.consentBox} htmlFor="register-terms">
            <input
              id="register-terms"
              type="checkbox"
              aria-required="true"
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={errors.acceptTerms ? 'register-terms-error' : undefined}
              {...register('acceptTerms', {
                required: 'Bạn cần tích đồng ý để tiếp tục đăng ký.',
              })}
            />
            <span>
              Tôi đã đọc và đồng ý với{' '}
              <span className={styles.policyLabel}>Điều khoản dịch vụ</span> và{' '}
              <span className={styles.policyLabel}>Chính sách quyền riêng tư</span>{' '}
              của UniJob <span className={styles.requiredNote}>(Bắt buộc)</span>
            </span>
          </label>
          {errors.acceptTerms && (
            <p id="register-terms-error" className={styles.error} role="alert">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {message && <p className={styles.error} role="alert">{message}</p>}
        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>

      <SocialAuthButtons mode="register" />
      <p className={styles.loginLink}>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
    </AuthLayout>
  );
}
