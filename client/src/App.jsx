import { useState } from 'react'
import React from 'react'
import './App.css'
import Welcome from "./Components/Welcome"
import UserPage from './Components/UserPage'
import UserAdminLogin from "./Components/UserAdminLogin"
import AdminPage from "./Components/AdminPage"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from './Components/Footer'
import ForgotPassword from './Components/ForgotPassword'
import MainAdminPage from './Components/MainAdminPage'
import ResetPassword from "./Components/ResetPassword"

// Nouveaux composants Admin DTStreetVoice
import AdminLayout from "./Components/Admin/AdminLayout"
import AdminDashboard from "./Components/Admin/AdminDashboard"
import CitizenManagement from "./Components/Admin/CitizenManagement"
import DepartmentManagement from "./Components/Admin/DepartmentManagement"
import InChargeManagement from "./Components/Admin/InChargeManagement"
import ServicesManagement from "./Components/Admin/ServicesManagement"
import RequestsManagement from "./Components/Admin/RequestsManagement"
import AnalyticsReports from "./Components/Admin/AnalyticsReports"
import NotificationManagement from "./Components/Admin/NotificationManagement"
import SettingsPage from "./Components/Admin/SettingsPage"
import GeoAnalytics from "./Components/Admin/GeoAnalytics"
import LiveRequests from "./Components/Admin/LiveRequests"

// Nouvelles pages Landing et Auth
import LandingPage from "./Components/LandingPage"
import AuthPage from "./Components/AuthPage"

// ServiceMan Components
import ServiceManLayout from "./Components/ServiceMan/ServiceManLayout"
import ServiceManDashboard from "./Components/ServiceMan/ServiceManDashboard"
import ServiceManComplaints from "./Components/ServiceMan/ServiceManComplaints"
import ServiceManReports from "./Components/ServiceMan/ServiceManReports"
import ComplaintDetail from "./Components/ServiceMan/ComplaintDetail"

// Department Components
import DepartmentLayout from "./Components/Department/DepartmentLayout"
import DepartmentDashboard from "./Components/Department/DepartmentDashboard"
import ServiceManManagement from "./Components/Department/ServiceManManagement"
import DepartmentComplaints from "./Components/Department/DepartmentComplaints"
import DepartmentStats from "./Components/Department/DepartmentStats"

// Admin Login
import AdminLogin from "./Components/Admin/AdminLogin"

// Logout
import Logout from "./Components/Logout"

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Nouvelle Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/logout" element={<Logout />} />

          {/* Routes existantes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/userpage" element={<UserPage />} />
          <Route path="/userlogin" element={<UserAdminLogin />} />
          <Route path="/adminpage" element={<AdminPage />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/MainAdminPage" element={<MainAdminPage />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />

          {/* Nouvelles routes Admin DTStreetVoice - Admin a son propre login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/live-requests" element={<AdminLayout><LiveRequests /></AdminLayout>} />
          <Route path="/admin/citizens" element={<AdminLayout><CitizenManagement /></AdminLayout>} />
          <Route path="/admin/departments" element={<AdminLayout><DepartmentManagement /></AdminLayout>} />
          <Route path="/admin/departments/incharge" element={<AdminLayout><InChargeManagement /></AdminLayout>} />
          <Route path="/admin/departments/inactive" element={<AdminLayout><InChargeManagement /></AdminLayout>} />
          <Route path="/admin/services" element={<AdminLayout><ServicesManagement /></AdminLayout>} />
          <Route path="/admin/requests" element={<AdminLayout><RequestsManagement /></AdminLayout>} />
          <Route path="/admin/analytics" element={<AdminLayout><AnalyticsReports /></AdminLayout>} />
          <Route path="/admin/notifications" element={<AdminLayout><NotificationManagement /></AdminLayout>} />
          <Route path="/admin/settings/app" element={<AdminLayout><SettingsPage type="app" /></AdminLayout>} />
          <Route path="/admin/settings/notifications" element={<AdminLayout><SettingsPage type="notifications" /></AdminLayout>} />
          <Route path="/admin/settings/panel" element={<AdminLayout><SettingsPage type="panel" /></AdminLayout>} />
          <Route path="/admin/geo-analytics" element={<AdminLayout><GeoAnalytics /></AdminLayout>} />

          {/* Routes ServiceMan */}
          <Route path="/serviceman" element={<ServiceManLayout><ServiceManDashboard /></ServiceManLayout>} />
          <Route path="/serviceman/complaints" element={<ServiceManLayout><ServiceManComplaints /></ServiceManLayout>} />
          <Route path="/serviceman/complaints/:id" element={<ServiceManLayout><ComplaintDetail /></ServiceManLayout>} />
          <Route path="/serviceman/reports" element={<ServiceManLayout><ServiceManReports /></ServiceManLayout>} />
          <Route path="/serviceman/profile" element={<ServiceManLayout><ServiceManDashboard /></ServiceManLayout>} />

          {/* Routes Department */}
          <Route path="/department" element={<DepartmentLayout><DepartmentDashboard /></DepartmentLayout>} />
          <Route path="/department/complaints" element={<DepartmentLayout><DepartmentComplaints /></DepartmentLayout>} />
          <Route path="/department/servicemen" element={<DepartmentLayout><ServiceManManagement /></DepartmentLayout>} />
          <Route path="/department/stats" element={<DepartmentLayout><DepartmentStats /></DepartmentLayout>} />
          <Route path="/department/profile" element={<DepartmentLayout><DepartmentDashboard /></DepartmentLayout>} />
        </Routes>
      </BrowserRouter>

    </>
  );
}


