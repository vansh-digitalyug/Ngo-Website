import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useLayoutEffect, lazy, Suspense } from "react";

// Only Home is eagerly loaded — it's the first thing the user sees
import Home from "../pages/home.jsx";


// ── Lazy-loaded pages ───────────────────────────────────────────────
const ServicePage             = lazy(() => import("../pages/service.jsx"));
const ServiceDiagnostics      = lazy(() => import("../pages/ServiceDiagnostics.jsx"));
const FindNGOs                = lazy(() => import("../pages/findNgo.jsx"));
const Donate                  = lazy(() => import("../pages/donate.jsx"));
const Volunteer               = lazy(() => import("../pages/volunteer.jsx"));
const AddNGO                  = lazy(() => import("../pages/addNgo.jsx"));
const Login                   = lazy(() => import("../pages/login.jsx"));
const Contact                 = lazy(() => import("../pages/contact.jsx"));
const EventsPage              = lazy(() => import("../pages/events.jsx"));
const BlogPage                = lazy(() => import("../pages/blog.jsx"));
const ResetPassword           = lazy(() => import("../pages/resetPassword.jsx"));
const Profile                 = lazy(() => import("../pages/profile.jsx"));
const VolunteerDashboard      = lazy(() => import("../pages/volunteer/VolunteerDashboard.jsx"));
const NgoPublicProfile        = lazy(() => import("../pages/NgoPublicProfile.jsx"));
const PrivacyPolicy           = lazy(() => import("../pages/PrivacyPolicy.jsx"));
const TermsOfService          = lazy(() => import("../pages/TermsOfService.jsx"));

// import AdminLayout from "../pages/admin/AdminLayout.jsx";
// import AdminLogin from "../pages/admin/AdminLogin.jsx";
// import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
// import AdminNgos from "../pages/admin/AdminNgos.jsx";
// import AdminVolunteers from "../pages/admin/AdminVolunteers.jsx";
// import AdminContacts from "../pages/admin/AdminContacts.jsx";
// import AdminUsers from "../pages/admin/AdminUsers.jsx";
// import AdminGallery from "../pages/admin/AdminGallery.jsx";
// import AdminBlogs from "../pages/admin/AdminBlogs.jsx";
// import AdminEvents from "../pages/admin/AdminEvents.jsx";
// import NgoEvents from "../pages/ngo/NgoEvents.jsx";
// import AdminKanyadan from "../pages/admin/AdminKanyadan.jsx";
// import AdminTasks from "../pages/admin/AdminTasks.jsx";
// import AdminDonations from "../pages/admin/AdminDonations.jsx";
// import AdminFundRequests from "../pages/admin/AdminFundRequests.jsx";
// import AdminPayments from "../pages/admin/AdminPayments.jsx";
// import AdminCompletedTasks from "../pages/admin/AdminCompletedTasks.jsx";
// import AddServices from "../pages/admin/AddServices.jsx";
// import ManageServices from "../pages/admin/ManageServices.jsx";
import AdminVillages from "../pages/admin/AdminVillages.jsx";
import AdminFundLedger from "../pages/admin/AdminFundLedger.jsx";

import VillageList from "../pages/villages/VillageList.jsx";
import VillageDetail from "../pages/villages/VillageDetail.jsx";
import Transparency from "../pages/Transparency.jsx";
import Disclaimer from "../pages/Disclaimer.jsx";


// Admin (heavy — all lazy)
const AdminLayout             = lazy(() => import("../pages/admin/AdminLayout.jsx"));
const AdminLogin              = lazy(() => import("../pages/admin/AdminLogin.jsx"));
const AdminDashboard          = lazy(() => import("../pages/admin/AdminDashboard.jsx"));
const AdminNgos               = lazy(() => import("../pages/admin/AdminNgos.jsx"));
const AdminVolunteers         = lazy(() => import("../pages/admin/AdminVolunteers.jsx"));
const AdminContacts           = lazy(() => import("../pages/admin/AdminContacts.jsx"));
const AdminUsers              = lazy(() => import("../pages/admin/AdminUsers.jsx"));
const AdminGallery            = lazy(() => import("../pages/admin/AdminGallery.jsx"));
const AdminBlogs              = lazy(() => import("../pages/admin/AdminBlogs.jsx"));
const AdminEvents             = lazy(() => import("../pages/admin/AdminEvents.jsx"));
const AdminKanyadan           = lazy(() => import("../pages/admin/AdminKanyadan.jsx"));
const AdminTasks              = lazy(() => import("../pages/admin/AdminTasks.jsx"));
const AdminDonations          = lazy(() => import("../pages/admin/AdminDonations.jsx"));
const AdminFundRequests       = lazy(() => import("../pages/admin/AdminFundRequests.jsx"));
const AdminPayments           = lazy(() => import("../pages/admin/AdminPayments.jsx"));
const AdminCompletedTasks     = lazy(() => import("../pages/admin/AdminCompletedTasks.jsx"));
const AddServices             = lazy(() => import("../pages/admin/AddServices.jsx"));
const ManageServices          = lazy(() => import("../pages/admin/ManageServices.jsx"));
const AdminCommunities        = lazy(() => import("../pages/admin/AdminCommunities.jsx"));

// NGO Dashboard
const NgoLayout               = lazy(() => import("../pages/ngo/NgoLayout.jsx"));
const NgoDashboard            = lazy(() => import("../pages/ngo/NgoDashboard.jsx"));
const NgoProfile              = lazy(() => import("../pages/ngo/NgoProfile.jsx"));
const NgoGallery              = lazy(() => import("../pages/ngo/NgoGallery.jsx"));
const NgoVolunteers           = lazy(() => import("../pages/ngo/NgoVolunteers.jsx"));
const NgoPending              = lazy(() => import("../pages/ngo/NgoPending.jsx"));
const NgoFundRequests         = lazy(() => import("../pages/ngo/NgoFundRequests.jsx"));
const NgoEvents               = lazy(() => import("../pages/ngo/NgoEvents.jsx"));

// Gallery
const GalleryImages           = lazy(() => import("../pages/gallery/GalleryImages.jsx"));
const GalleryVideos           = lazy(() => import("../pages/gallery/GalleryVideos.jsx"));

// Service sub-pages
const OrphanageEducationPage  = lazy(() => import("../pages/services/orphanage/education.jsx"));
const Meal                    = lazy(() => import("../pages/services/orphanage/meal.jsx"));
const Health                  = lazy(() => import("../pages/services/orphanage/health.jsx"));
const ElderMeal               = lazy(() => import("../pages/services/elder/elderMeal.jsx"));
const Living                  = lazy(() => import("../pages/services/elder/living.jsx"));
const Medical                 = lazy(() => import("../pages/services/elder/medical.jsx"));
const HelmetDrive             = lazy(() => import("../pages/services/community/helmet.jsx"));
const KanyadanYojna           = lazy(() => import("../pages/services/welfare/kanyadan.jsx"));
const Rites                   = lazy(() => import("../pages/services/welfare/rites.jsx"));
const FreeHealthCamp          = lazy(() => import("../pages/services/medical/camp.jsx"));
const CancerSupport           = lazy(() => import("../pages/services/medical/cancer.jsx"));
const KidneySupport           = lazy(() => import("../pages/services/medical/kidney.jsx"));
const RoadConstruction        = lazy(() => import("../pages/services/infrastructure/road-construction.jsx"));
const WidowWomen              = lazy(() => import("../pages/services/women/widow-women.jsx"));
const WomenEmpowerment        = lazy(() => import("../pages/services/women/empowerment.jsx"));
const GauSeva                 = lazy(() => import("../pages/services/animal/cowHelp.jsx"));
const DynamicServicePage      = lazy(() => import("../pages/services/DynamicServicePage.jsx"));

// About / Get Involved
const OurStory                = lazy(() => import("../pages/about/OurStory.jsx"));
const Strategy2045            = lazy(() => import("../pages/about/Strategy2045.jsx"));
const OurBoard                = lazy(() => import("../pages/about/OurBoard.jsx"));
const Founders                = lazy(() => import("../pages/about/Founders.jsx"));
const WorkWithUs              = lazy(() => import("../pages/WorkWithUs.jsx"));

// Community
const CommunityRoutes         = lazy(() => import("./CommunityRoutes.jsx"));

// ── Page loader fallback ────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #e5e7eb", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Auth guards ─────────────────────────────────────────────────────
function RequireVolunteerAuth({ children }) {
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("user"));

  if (!isLoggedIn) {
    sessionStorage.setItem(
      "flash_message",
      JSON.stringify({ type: "info", message: "Please log in to access this page." })
    );
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
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
  } catch { /* invalid JSON — treat as regular user */ }
  return (
    <Suspense fallback={<PageLoader />}>
      <Profile />
    </Suspense>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ── Routes ──────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/services" element={<ServicePage />} />
          <Route path="/services/:category" element={<ServicePage />} />
          <Route path="/_test" element={<ServiceDiagnostics />} />

          {/* Service sub-pages — old paths */}
          <Route path="/services/orphanage/education"               element={<OrphanageEducationPage />} />
          <Route path="/services/orphanage/meal"                    element={<Meal />} />
          <Route path="/services/orphanage/health"                  element={<Health />} />
          <Route path="/services/elder/meal"                        element={<ElderMeal />} />
          <Route path="/services/elder/living"                      element={<Living />} />
          <Route path="/services/elder/medical"                     element={<Medical />} />
          <Route path="/services/safety/helmet"                     element={<HelmetDrive />} />
          <Route path="/services/welfare/kanyadan"                  element={<KanyadanYojna />} />
          <Route path="/services/welfare/rites"                     element={<Rites />} />
          <Route path="/services/medical/camp"                      element={<FreeHealthCamp />} />
          <Route path="/services/medical/cancer"                    element={<CancerSupport />} />
          <Route path="/services/medical/kidney"                    element={<KidneySupport />} />
          <Route path="/services/infrastructure/road-construction"  element={<RoadConstruction />} />
          <Route path="/services/women/widow-women"                 element={<WidowWomen />} />
          <Route path="/services/women/empowerment"                 element={<WomenEmpowerment />} />
          <Route path="/services/animal/gau-seva"                   element={<GauSeva />} />

          {/* Service sub-pages — consistent /services/{categoryId}/{slug} */}
          <Route path="/services/orphan/education"                          element={<OrphanageEducationPage />} />
          <Route path="/services/orphan/meal"                               element={<Meal />} />
          <Route path="/services/orphan/health"                             element={<Health />} />
          <Route path="/services/medical-support/camp"                      element={<FreeHealthCamp />} />
          <Route path="/services/medical-support/cancer"                    element={<CancerSupport />} />
          <Route path="/services/medical-support/kidney"                    element={<KidneySupport />} />
          <Route path="/services/women-empowerment/widow-women"             element={<WidowWomen />} />
          <Route path="/services/women-empowerment/empowerment"             element={<WomenEmpowerment />} />
          <Route path="/services/social-welfare/kanyadan"                   element={<KanyadanYojna />} />
          <Route path="/services/social-welfare/rites"                      element={<Rites />} />
          <Route path="/services/community-safety/helmet"                   element={<HelmetDrive />} />
          <Route path="/services/infrastructure-development/road-construction" element={<RoadConstruction />} />

          {/* Dynamic catch-all for admin-created programs */}
          <Route path="/services/:categorySlug/:programSlug" element={<DynamicServicePage />} />

          {/* Gallery */}
          <Route path="/gallery/images" element={<GalleryImages />} />
          <Route path="/gallery/videos" element={<GalleryVideos />} />

          {/* General */}
          <Route path="/events"           element={<EventsPage />} />
          <Route path="/blog"             element={<BlogPage />} />
          <Route path="/blog/:id"         element={<BlogPage />} />
          <Route path="/community/*"      element={<CommunityRoutes />} />
          <Route path="/find-ngos"        element={<FindNGOs />} />
          <Route path="/ngo-profile/:id"  element={<NgoPublicProfile />} />
          <Route path="/donate"           element={<Donate />} />
          <Route path="/add-ngo"          element={<AddNGO />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />


          {/* Auth */}
          <Route path="/login"                    element={<LoginRedirect />} />
          <Route path="/login/user"               element={<Login />} />
          <Route path="/login/ngo"                element={<Login />} />
          <Route path="/login/admin"              element={<AdminLogin />} />
          <Route path="/forgot-password"          element={<Navigate to="/login/user?forgot=1" replace />} />
          <Route path="/reset-password"           element={<ResetPassword />} />
          <Route path="/reset-password/:token"    element={<ResetPassword />} />

          {/* About */}
          <Route path="/about/our-story"      element={<OurStory />} />
          <Route path="/about/strategy-2045"  element={<Strategy2045 />} />
          <Route path="/about/our-board"      element={<OurBoard />} />
          <Route path="/about/founders"       element={<Founders />} />
          <Route path="/work-with-us"         element={<WorkWithUs />} />

        {/* Get Involved Routes */}
        <Route path="/work-with-us" element={<WorkWithUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/villages" element={<VillageList />} />
        <Route path="/villages/:id" element={<VillageDetail />} />
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
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kanyadan" element={<AdminKanyadan />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="funds" element={<AdminFundRequests />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="completed-tasks" element={<AdminCompletedTasks />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="services/add" element={<AddServices />} />
          <Route path="services/manage" element={<ManageServices />} />
          <Route path="villages" element={<AdminVillages />} />
          <Route path="fund-ledger" element={<AdminFundLedger />} />
        </Route>


          {/* Protected */}
          <Route path="/volunteer" element={<RequireVolunteerAuth><Volunteer /></RequireVolunteerAuth>} />
          <Route path="/profile"   element={<RequireVolunteerAuth><ProfileOrAdmin /></RequireVolunteerAuth>} />
          <Route path="/volunteer-dashboard" element={<RequireVolunteerAuth><VolunteerDashboard /></RequireVolunteerAuth>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index             element={<AdminDashboard />} />
            <Route path="ngos"           element={<AdminNgos />} />
            <Route path="volunteers"     element={<AdminVolunteers />} />
            <Route path="contacts"       element={<AdminContacts />} />
            <Route path="gallery"        element={<AdminGallery />} />
            <Route path="blogs"          element={<AdminBlogs />} />
            <Route path="users"          element={<AdminUsers />} />
            <Route path="kanyadan"       element={<AdminKanyadan />} />
            <Route path="donations"      element={<AdminDonations />} />
            <Route path="tasks"          element={<AdminTasks />} />
            <Route path="funds"          element={<AdminFundRequests />} />
            <Route path="payments"       element={<AdminPayments />} />
            <Route path="completed-tasks" element={<AdminCompletedTasks />} />
            <Route path="events"         element={<AdminEvents />} />
            <Route path="services/add"   element={<AddServices />} />
            <Route path="services/manage" element={<ManageServices />} />
            <Route path="communities"    element={<AdminCommunities />} />
          </Route>

          {/* NGO Dashboard */}
          <Route path="/ngo/pending" element={<NgoPending />} />
          <Route path="/ngo" element={<NgoLayout />}>
            <Route index              element={<NgoDashboard />} />
            <Route path="dashboard"   element={<NgoDashboard />} />
            <Route path="profile"     element={<NgoProfile />} />
            <Route path="gallery"     element={<NgoGallery />} />
            <Route path="volunteers"  element={<NgoVolunteers />} />
            <Route path="funds"       element={<NgoFundRequests />} />
            <Route path="events"      element={<NgoEvents />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default AppRoutes;
