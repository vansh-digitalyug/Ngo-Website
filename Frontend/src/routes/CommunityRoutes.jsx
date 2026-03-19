import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../components/community/CommunityUI';

const CommunityList            = lazy(() => import('../pages/community/CommunityList'));
const CommunityDetail          = lazy(() => import('../pages/community/CommunityDetail'));
const CommunityRegister        = lazy(() => import('../pages/community/CommunityRegister'));
const CommunityLeaderDashboard = lazy(() => import('../pages/community/CommunityLeaderDashboard'));
const MyResponsibilities       = lazy(() => import('../pages/community/MyResponsibilities'));
const ActivityCreate           = lazy(() => import('../pages/community/ActivityCreate'));
const ActivityDetail           = lazy(() => import('../pages/community/ActivityDetail'));
const MyActivities             = lazy(() => import('../pages/community/MyActivities'));

const CommunityRoutes = () => (
  <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
    <Routes>
      {/* Public */}
      <Route path="/"    element={<CommunityList />} />
      <Route path="/:id" element={<CommunityDetail />} />

      {/* User pages */}
      <Route path="/register"            element={<CommunityRegister />} />
      <Route path="/dashboard"           element={<CommunityLeaderDashboard />} />
      <Route path="/my-responsibilities" element={<MyResponsibilities />} />
      <Route path="/my-activities"       element={<MyActivities />} />

      {/* Activity routes */}
      <Route path="/:communityId/activities/create"       element={<ActivityCreate />} />
      <Route path="/:communityId/activities/:activityId"  element={<ActivityDetail />} />

      <Route path="*" element={<div className="container mx-auto px-4 py-8 text-center text-gray-600">Page not found</div>} />
    </Routes>
  </Suspense>
);

export default CommunityRoutes;
