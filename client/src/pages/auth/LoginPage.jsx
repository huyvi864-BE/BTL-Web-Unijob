import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router';

import SocialAuthButtons from '../../components/auth/SocialAuthButtons.jsx';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import illustration from '../../assets/unijob-login.webp';
import { useAuth } from '../../context/useAuth.js';
import styles from './LoginPage.module.css';

function destination(role) {
  return role === 'employer'
    ? '/employer/jobs'
    : '/student/profile';
}

export default function LoginPage() {
  const { user, login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function submit({ email, password }) {
    setMessage('');

    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return;

      setMessage(
        error.response?.data?.error?.message
        || 'Không thể đăng nhập. Hãy thử lại.',
      );
    }
  }

  if (user) {
    return <Navigate to={destination(user.role)} replace />;
  }

  return (
    <AuthLayout
      visual={(
        <div className={styles.feature}>
          <img
            className={styles.illustration}
            src={illustration}
            alt=""
            width="1024"
            height="1024"
          />
          <div className={styles.featureCopy}>
            <div>
              <h2>Từ giảng đường đến công việc đầu tiên.</h2>
              <p>Tìm cơ hội thực tập và việc làm bán thời gian phù hợp với bạn.</p>
            </div>
            <span className={styles.featureArrow} aria-hidden="true">
              <ArrowDownRight size={23} />
            </span>
          </div>
        </div>
      )}
    >
      <h1 id="login-title" className={styles.title}>
        Chào mừng
        <br />
        bạn trở lại!
      </h1>

      <p className={styles.intro}>
        Đăng nhập để tìm việc làm, khám phá kỳ thực tập
        và theo dõi hồ sơ ứng tuyển.
      </p>

      <form
        className={styles.form}
        noValidate
        onSubmit={handleSubmit(submit)}
      >
        <div>
          <label
            className={styles.label}
            htmlFor="login-email"
          >
            Email
          </label>

          <div className={styles.field}>
            <Mail
              size={19}
              className={styles.fieldIcon}
              aria-hidden="true"
            />

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'login-email-error' : undefined
              }
              {...register('email', {
                required: 'Hãy nhập email.',
                validate: (value) => (
                  /^(\S+)@(\S+)\.(\S+)$/.test(value.trim())
                  || 'Hãy nhập email hợp lệ.'
                ),
              })}
            />
          </div>

          {errors.email && (
            <p
              className={styles.error}
              id="login-email-error"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            className={styles.label}
            htmlFor="login-password"
          >
            Mật khẩu
          </label>

          <div className={styles.field}>
            <LockKeyhole
              size={19}
              className={styles.fieldIcon}
              aria-hidden="true"
            />

            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? 'login-password-error'
                  : undefined
              }
              {...register('password', {
                required: 'Hãy nhập mật khẩu.',
              })}
            />

            <button
              className={styles.eye}
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-controls="login-password"
              aria-label={
                showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
              }
            >
              {showPassword ? (
                <EyeOff size={19} aria-hidden="true" />
              ) : (
                <Eye size={19} aria-hidden="true" />
              )}
            </button>
          </div>

          {errors.password && (
            <p
              className={styles.error}
              id="login-password-error"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {message && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}

        <button
          className={styles.submit}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      </form>

      <SocialAuthButtons mode="login" />

      <p className={styles.register}>
        Chưa có tài khoản?{' '}
        <Link to="/register">Đăng ký ngay</Link>
      </p>
    </AuthLayout>
  );
}
