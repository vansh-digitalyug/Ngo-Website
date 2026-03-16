import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";

import Home from "../pages/home.jsx";
import ServicePage from "../pages/service.jsx";
import ServiceDiagnostics from "../pages/ServiceDiagnostics.jsx";
import FindNGOs from "../pages/findNgo.jsx";
import Donate from "../pages/donate.jsx";
import Volunteer from "../pages/volunteer.jsx";
import AddNGO from "../pages/addNgo.jsx";
import Login from "../pages/login.jsx";
import Contact from "../pages/contact.jsx";
import ResetPassword from "../pages/resetPassword.jsx";
import Profile from "../pages/profile.jsx";
import VolunteerDashboard from "../pages/volunteer/VolunteerDashboard.jsx";

import AdminLayout from "../pages/admin/AdminLayout.jsx";
import AdminLogin from "../pages/admin/AdminLogin.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminNgos from "../pages/admin/AdminNgos.jsx";
import AdminVolunteers from "../pages/admin/AdminVolunteers.jsx";
import AdminContacts from "../pages/admin/AdminContacts.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminGallery from "../pages/admin/AdminGallery.jsx";
import AdminKanyadan from "../pages/admin/AdminKanyadan.jsx";
import AdminTasks from "../pages/admin/AdminTasks.jsx";
import AdminDonations from "../pages/admin/AdminDonations.jsx";
import AdminFundRequests from "../pages/admin/AdminFundRequests.jsx";
import AdminPayments from "../pages/admin/AdminPayments.jsx";
import AdminCompletedTasks from "../pages/admin/AdminCompletedTasks.jsx";
import AddServices from "../pages/admin/AddServices.jsx";
import ManageServices from "../pages/admin/ManageServices.jsx";

// NGO Dashboard imports
import {
  NgoLayout,
  NgoDashboard,
  NgoProfile,
  NgoGallery,
  NgoVolunteers,
  NgoPending,
  NgoFundRequests
} from "../pages/ngo/index.js";

import GalleryImages from "../pages/gallery/GalleryImages.jsx";
import GalleryVideos from "../pages/gallery/GalleryVideos.jsx";
import NgoPublicProfile from "../pages/NgoPublicProfile.jsx";
import PrivacyPolicy from "../pages/PrivacyPolicy.jsx";
import TermsOfService from "../pages/TermsOfService.jsx";

import OrphanageEducationPage from "../pages/services/orphanage/education.jsx";
import Meal from "../pages/services/orphanage/meal.jsx";
import Health from "../pages/services/orphanage/health.jsx";
import ElderMeal from "../pages/services/elder/elderMeal.jsx";
import Living from "../pages/services/elder/living.jsx";
import Medical from "../pages/services/elder/medical.jsx";
import HelmetDrive from "../pages/services/community/helmet.jsx";
import KanyadanYojna from "../pages/services/welfare/kanyadan.jsx";
import Rites from "../pages/services/welfare/rites.jsx";
import FreeHealthCamp from "../pages/services/medical/camp.jsx";
import CancerSupport from "../pages/services/medical/cancer.jsx";
import KidneySupport from "../pages/services/medical/kidney.jsx";
import RoadConstruction from "../pages/services/infrastructure/road-construction.jsx";
import WidowWomen from "../pages/services/women/widow-women.jsx";
import WomenEmpowerment from "../pages/services/women/empowerment.jsx";
import GauSeva from "../pages/services/animal/cowHelp.jsx";
import DynamicServicePage from "../pages/services/DynamicServicePage.jsx";

function RequireVolunteerAuth({ children }) {
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("user"));

  if (!isLoggedIn) {
    sessionStorage.setItem(
      "flash_message",
      JSON.stringify({
        type: "info",
        message: "Please log in to access the volunteer page.",
      })
    );

    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectTo: location.pathname }}
      />
    );
  }

  return children;
}

function LoginRedirect() {
  const location = useLocation();
  return <Navigate to={`/login/user${location.search}`} replace />;
}

function ProfileOrAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
  } catch { /* invalid JSON in localStorage — treat as regular user */ }
  return <Profile />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/_test" element={<ServiceDiagnostics />} />

        {/* Service Routes */}
        <Route path="/services/orphanage/education" element={<OrphanageEducationPage />} />
        <Route path="/services/orphanage/meal" element={<Meal />} />
        <Route path="/services/orphanage/health" element={<Health />} />
        <Route path="/services/elder/meal" element={<ElderMeal />} />
        <Route path="/services/elder/living" element={<Living />} />
        <Route path="/services/elder/medical" element={<Medical />} />
        <Route path="/services/safety/helmet" element={<HelmetDrive />} />
        <Route path="/services/welfare/kanyadan" element={<KanyadanYojna />} />
        <Route path="/services/welfare/rites" element={<Rites />} />
        <Route path="/services/medical/camp" element={<FreeHealthCamp />} />
        <Route path="/services/medical/cancer" element={<CancerSupport />} />
        <Route path="/services/medical/kidney" element={<KidneySupport />} />
        <Route path="/services/infrastructure/road-construction" element={<RoadConstruction />} />
        <Route path="/services/women/widow-women" element={<WidowWomen />} />
        <Route path="/services/women/empowerment" element={<WomenEmpowerment />} />
        <Route path="/services/animal/gau-seva" element={<GauSeva />} />

        {/* Dynamic catch-all for admin-created service programs */}
        <Route path="/services/:categorySlug/:programSlug" element={<DynamicServicePage />} />

        {/* Gallery Routes */}
        <Route path="/gallery/images" element={<GalleryImages />} />
        <Route path="/gallery/videos" element={<GalleryVideos />} />

        <Route path="/find-ngos" element={<FindNGOs />} />
        <Route path="/ngo-profile/:id" element={<NgoPublicProfile />} />
        <Route path="/donate" element={<Donate />} />
        <Route
          path="/volunteer"
          element={
            <RequireVolunteerAuth>
              <Volunteer />
            </RequireVolunteerAuth>
          }
        />
        <Route path="/add-ngo" element={<AddNGO />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/login/user" element={<Login />} />
        <Route path="/login/ngo" element={<Login />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<Navigate to="/login/user?forgot=1" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route
          path="/profile"
          element={
            <RequireVolunteerAuth>
              <ProfileOrAdmin />
            </RequireVolunteerAuth>
          }
        />
        <Route
          path="/volunteer-dashboard"
          element={
            <RequireVolunteerAuth>
              <VolunteerDashboard />
            </RequireVolunteerAuth>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="ngos" element={<AdminNgos />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kanyadan" element={<AdminKanyadan />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="funds" element={<AdminFundRequests />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="completed-tasks" element={<AdminCompletedTasks />} />
          <Route path="services/add" element={<AddServices />} />
          <Route path="services/manage" element={<ManageServices />} />
        </Route>

        {/* NGO Dashboard Routes */}
        <Route path="/ngo/pending" element={<NgoPending />} />
        <Route path="/ngo" element={<NgoLayout />}>
          <Route index element={<NgoDashboard />} />
          <Route path="dashboard" element={<NgoDashboard />} />
          <Route path="profile" element={<NgoProfile />} />
          <Route path="gallery" element={<NgoGallery />} />
          <Route path="volunteers" element={<NgoVolunteers />} />
          <Route path="funds" element={<NgoFundRequests />} />
        </Route>

      </Routes>
    </>
  );
}

export default AppRoutes;
