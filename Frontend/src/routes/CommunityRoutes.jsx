import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const CommunityFeed       = lazy(() => import('../pages/community/CommunityFeed'));
const CommunityPostDetail = lazy(() => import('../pages/community/CommunityPostDetail'));

const CommunityRoutes = () => (
  <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>Loading…</div>}>
    <Routes>
      <Route path="/"    element={<CommunityFeed />} />
      <Route path="/:id" element={<CommunityPostDetail />} />
      <Route path="*"    element={<div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>Page not found</div>} />
    </Routes>
  </Suspense>
);

export default CommunityRoutes;
