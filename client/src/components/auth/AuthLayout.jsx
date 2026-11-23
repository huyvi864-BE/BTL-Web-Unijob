import { ArrowLeft, BriefcaseBusiness, Check } from 'lucide-react';
import { Link } from 'react-router';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children, visual, showVisualOnMobile = false, variant = 'login' }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="UniJob, trang chủ">
          <span className={styles.brandIcon}><BriefcaseBusiness size={21} aria-hidden="true" /></span>
          Uni<span>Job</span>
        </Link>
        <span className={styles.tagline}>Cơ hội mới. Khởi đầu mới.</span>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={17} aria-hidden="true" /> Tìm việc làm
        </Link>
      </header>

      <main className={styles.surface}>
         <div className={`${styles.columns} ${variant === 'register' ? styles.registerColumns : ''}`}>

            <section className={styles.formSide}>
                {children}
            </section>
            <aside className={`${styles.visualSide} ${showVisualOnMobile ? styles.showOnMobile : ''}`}>
                {visual}
            </aside>
        </div>
        </main>

      <footer className={styles.footer}>
        <span><Check size={15} aria-hidden="true" /> Dành cho sinh viên</span>
        <span className={styles.footerDot} aria-hidden="true" />
        <span><Check size={15} aria-hidden="true" /> Kết nối doanh nghiệp</span>
      </footer>
    </div>
  );
}
