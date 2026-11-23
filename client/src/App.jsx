import { Outlet, Route, Routes } from 'react-router';

import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
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

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route element={<ProtectedRoute role="student" />}>
          <Route
            path="/student/profile"
            element={<StudentProfilePage />}
          />

          <Route
            path="/student/applications"
            element={<StudentApplicationsPage />}
          />
        </Route>

        <Route element={<ProtectedRoute role="employer" />}>
          <Route
            path="/employer/profile"
            element={<CompanyProfilePage />}
          />

          <Route
            path="/employer/jobs"
            element={<EmployerJobDashboard />}
          />

          <Route
            path="/employer/jobs/:jobId/applicants"
            element={<ApplicantReviewPage />}
          />
        </Route>

        <Route
          path="*"
          element={<p>Không tìm thấy trang.</p>}
        />
      </Route>
    </Routes>
  );
}
