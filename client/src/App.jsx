import { Route, Routes } from 'react-router';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import StudentProfilePage from './pages/profile/StudentProfilePage.jsx';
import CompanyProfilePage from './pages/profile/CompanyProfilePage.jsx';
import JobListPage from './pages/jobs/JobListPage.jsx';
import JobDetailPage from './pages/jobs/JobDetailPage.jsx';
import EmployerJobDashboard from './pages/jobs/EmployerJobDashboard.jsx';
import StudentApplicationsPage from './pages/applications/StudentApplicationsPage.jsx';
import ApplicantReviewPage from './pages/applications/ApplicantReviewPage.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <Routes>
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/applications" element={<StudentApplicationsPage />} />
          <Route path="/employer/profile" element={<CompanyProfilePage />} />
          <Route path="/employer/jobs" element={<EmployerJobDashboard />} />
          <Route path="/employer/jobs/:jobId/applicants" element={<ApplicantReviewPage />} />
          <Route path="*" element={<p>Không tìm thấy trang.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}