import styles from './SocialAuthButtons.module.css';

function GoogleIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.49H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.51l3.34-2.59Z" />
      <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#6D13DC" />
      <circle cx="7" cy="7" r="1.4" fill="#fff" />
      <path fill="#fff" d="M5.8 9.4h2.4V18H5.8zm4.5 0h2.3v1.2c.5-.9 1.3-1.5 2.6-1.5 2.2 0 3 1.4 3 3.7V18h-2.5v-4.7c0-1.2-.2-2-1.4-2-1.3 0-1.5 1-1.5 2V18h-2.5z" />
    </svg>
  );
}

export default function SocialAuthButtons({ mode }) {
  const action = mode === 'login' ? 'Đăng nhập' : 'Đăng ký';

  return (
    <div className={styles.section}>
      <div className={styles.divider}><span>hoặc tiếp tục với</span></div>
      <div className={styles.buttons}>
        <button className={styles.button} type="button" disabled>
          <GoogleIcon />
          <span>{action} bằng Google</span>
        </button>
        <button className={styles.button} type="button" disabled>
          <LinkedInIcon />
          <span>{action} bằng LinkedIn</span>
        </button>
      </div>
    </div>
  );
}
