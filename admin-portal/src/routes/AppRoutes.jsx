import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { GuestRoute, PrivateRoute } from './ProtectedRoutes';

import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminTickets from '../pages/admin/AdminTickets';
import BuyerDetails from '../pages/admin/BuyerDetails';
import CollegeKycDetails from '../pages/admin/CollegeKycDetails';
import CollegeVerification from '../pages/admin/CollegeVerification';
import ManageBuyers from '../pages/admin/ManageBuyers';
import ManageCompanies from '../pages/admin/ManageCompanies';
import ManageCoupons from '../pages/admin/ManageCoupons';
import ManageJobs from '../pages/admin/ManageJobs';
import ManagePayPer from '../pages/admin/ManagePayPer';
import ManageRefunds from '../pages/admin/ManageRefunds';
import ManageRenewals from '../pages/admin/ManageRenewals';
import ManageRequests from '../pages/admin/ManageRequests';
import ManageReviews from '../pages/admin/ManageReviews';
import ManageSubscriptions from '../pages/admin/ManageSubscriptions';
import ManageUsers from '../pages/admin/ManageUsers';
import PaymentHistory from '../pages/admin/PaymentHistory';
import UserProfile from '../pages/admin/UserProfile';
import Applicants from '../pages/company/Applicants';
import Messages from '../pages/Messages';
import SubAdminDashboard from '../pages/subadmin/Dashboard';

const AdminOnly = ({ children }) => (
  <PrivateRoute roles={['admin']}>{children}</PrivateRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route
        path="/login"
        element={<GuestRoute><AdminLogin /></GuestRoute>}
      />
    </Route>

    <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
      <Route path="/admin/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
      <Route path="/admin/users" element={<AdminOnly><ManageUsers /></AdminOnly>} />
      <Route path="/admin/users/:id" element={<AdminOnly><UserProfile /></AdminOnly>} />
      <Route path="/admin/jobs" element={<AdminOnly><ManageJobs /></AdminOnly>} />
      <Route path="/admin/jobs/:jobId/applicants" element={<AdminOnly><Applicants /></AdminOnly>} />
      <Route path="/admin/companies" element={<AdminOnly><ManageCompanies /></AdminOnly>} />
      <Route path="/admin/colleges" element={<AdminOnly><CollegeVerification /></AdminOnly>} />
      <Route path="/admin/colleges/:id" element={<AdminOnly><CollegeKycDetails /></AdminOnly>} />
      <Route path="/admin/subscriptions/plans" element={<AdminOnly><ManageSubscriptions /></AdminOnly>} />
      <Route path="/admin/subscriptions/renewals" element={<AdminOnly><ManageRenewals /></AdminOnly>} />
      <Route path="/admin/subscriptions/refunds" element={<AdminOnly><ManageRefunds /></AdminOnly>} />
      <Route path="/admin/subscriptions/buyers" element={<AdminOnly><ManageBuyers /></AdminOnly>} />
      <Route path="/admin/subscriptions/buyers/:id" element={<AdminOnly><BuyerDetails /></AdminOnly>} />
      <Route path="/admin/subscriptions/pay-per" element={<AdminOnly><ManagePayPer /></AdminOnly>} />
      <Route path="/admin/subscriptions/coupons" element={<AdminOnly><ManageCoupons /></AdminOnly>} />
      <Route path="/admin/messages" element={<AdminOnly><Messages /></AdminOnly>} />
      <Route path="/admin/payment-history" element={<AdminOnly><PaymentHistory /></AdminOnly>} />
      <Route path="/admin/requests" element={<AdminOnly><ManageRequests /></AdminOnly>} />
      <Route path="/admin/settings" element={<AdminOnly><AdminSettings /></AdminOnly>} />
      <Route path="/admin/tickets" element={<AdminOnly><AdminTickets /></AdminOnly>} />
      <Route path="/admin/reviews" element={<AdminOnly><ManageReviews /></AdminOnly>} />
      <Route path="/subadmin/*" element={<PrivateRoute roles={['subadmin']}><SubAdminDashboard /></PrivateRoute>} />
    </Route>

    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/subscriptions" element={<Navigate to="/admin/subscriptions/plans" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
