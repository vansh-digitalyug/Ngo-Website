# Community Feature Integration Guide

## 🎯 Overview

This guide explains how to integrate the complete Community Feature into your main React application. The community feature includes:

- **Public Pages**: Browse and discover communities
- **Leader Pages**: Register and manage communities
- **Activity Management**: Create and manage community activities
- **Task Management**: Assign and track responsibilities
- **Real-time Search**: Search communities by location and filters

## 📁 File Structure Created

```
Frontend/src/
├── services/
│   └── communityService.js         # API service layer
├── hooks/
│   └── useCommunity.js             # Custom hooks for state management
├── components/community/
│   ├── CommunityCard.jsx           # Community card component
│   ├── ActivityCard.jsx            # Activity card component
│   ├── ResponsibilityCard.jsx      # Task card component
│   ├── CommunitySearch.jsx         # Search & filter component
│   └── index.js                    # Utility components & loaders
├── pages/community/
│   ├── CommunityList.jsx           # Public community listing
│   ├── CommunityDetail.jsx         # Community detail view
│   ├── CommunityRegister.jsx       # Register new community (leader)
│   └── CommunityLeaderDashboard.jsx # Leader dashboard
├── pages/communityActivities/
│   └── ActivityCreate.jsx          # Create activity page
├── pages/communityResponsibilities/
│   └── (ResponsibilityCreate.jsx - to be created)
└── routes/
    └── CommunityRoutes.jsx         # Route configuration
```

## 🚀 Integration Steps

### Step 1: Add Community Routes to Your Main App

If your app structure is like this:

```jsx
// App.jsx or main router file
import { BrowserRouter, Routes, Route } from 'react-router-dom';
```

Add the community routes:

```jsx
import CommunityRoutes from './routes/CommunityRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Other routes */}
        <Route path="/community/*" element={<CommunityRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 2: Update Environment Variables

Add your backend API URL to `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Or in `vite.config.js` if using Vite:

```javascript
export default defineConfig({
  define: {
    'process.env.REACT_APP_API_URL': JSON.stringify('http://localhost:5000/api')
  }
})
```

### Step 3: Add Navigation Links

Update your navbar/navigation to include community links:

```jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <Link to="/community">Community</Link>
      <Link to="/community/register">Register Community</Link>
      <Link to="/community/dashboard">My Community</Link>
    </nav>
  );
}
```

### Step 4: Ensure Tailwind CSS is Configured

The components use Tailwind CSS. Make sure your `tailwind.config.js` is set up:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 5: Install Required Dependencies

Make sure you have these packages installed:

```bash
npm install axios lucide-react react-router-dom
```

## 🔌 Available Routes

| Route | Component | Type | Description |
|-------|-----------|------|-------------|
| `/community` | CommunityList | Public | Browse all communities with search |
| `/community/:id` | CommunityDetail | Public | View community details & activities |
| `/community/register` | CommunityRegister | Protected | Register new community (leader) |
| `/community/dashboard` | CommunityLeaderDashboard | Protected | Community leader dashboard |
| `/community/:id/activities/create` | ActivityCreate | Protected | Create new activity |

## 📚 Using the Custom Hooks

### useCommunity Hook

```jsx
import { useCommunity } from '../hooks/useCommunity';

function MyComponent() {
  const {
    communities,
    selectedCommunity,
    loading,
    error,
    fetchCommunities,
    searchCommunities,
    getCommunity,
    registerCommunity,
    updateCommunity
  } = useCommunity();

  // Fetch all communities
  useEffect(() => {
    fetchCommunities({ page: 1, limit: 10 });
  }, []);

  // Search communities
  const handleSearch = (query) => {
    searchCommunities({
      search: query,
      city: 'Mumbai',
      areaType: 'mohalla'
    });
  };

  // Get single community
  const loadCommunity = async (id) => {
    await getCommunity(id);
  };

  return (
    // Your JSX
  );
}
```

### useActivity Hook

```jsx
import { useActivity } from '../hooks/useCommunity';

function ActivityComponent() {
  const communityId = 'community-123';
  const {
    activities,
    selectedActivity,
    loading,
    error,
    fetchActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    joinActivity,
    leaveActivity
  } = useActivity(communityId);

  // Fetch activities
  useEffect(() => {
    fetchActivities();
  }, []);

  // Create activity
  const handleCreateActivity = async () => {
    await createActivity({
      title: 'Community Cleanup',
      description: 'Clean up the park',
      date: new Date(),
      location: 'Central Park',
      type: 'cleanup'
    });
  };

  return (
    // Your JSX
  );
}
```

### useResponsibility Hook

```jsx
import { useResponsibility } from '../hooks/useCommunity';

function ResponsibilityComponent() {
  const communityId = 'community-123';
  const {
    responsibilities,
    loading,
    error,
    fetchResponsibilities,
    createResponsibility,
    updateResponsibility,
    deleteResponsibility
  } = useResponsibility(communityId);

  // Fetch responsibilities
  useEffect(() => {
    fetchResponsibilities();
  }, []);

  // Create task
  const handleCreateTask = async () => {
    await createResponsibility({
      title: 'Event Planning',
      description: 'Plan the summer festival',
      assignedTo: 'user-123',
      dueDate: new Date('2024-06-30'),
      priority: 'high'
    });
  };

  return (
    // Your JSX
  );
}
```

### useLocation Hook

```jsx
import { useLocation } from '../hooks/useCommunity';

function LocationComponent() {
  const {
    latitude,
    longitude,
    loading,
    error,
    getCurrentLocation,
    setManualLocation
  } = useLocation();

  return (
    <button onClick={getCurrentLocation}>
      Get My Location
    </button>
  );
}
```

## 🔐 Protected Routes

These routes require authentication:
- `/community/register` - Requires login + community leader role
- `/community/dashboard` - Requires login + ownership of community
- `/community/:id/activities/create` - Requires login + leader permission

To protect routes, wrap them with an auth check:

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated, requiredRole }) {
  const userRole = localStorage.getItem('userRole'); // Get from auth context

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Usage in routes:
<Route
  path="/community/register"
  element={
    <ProtectedRoute isAuthenticated={isLoggedIn} requiredRole="leader">
      <CommunityRegister />
    </ProtectedRoute>
  }
/>
```

## 📡 API Integration

The `communityService.js` automatically:
- Adds JWT token from `localStorage.authToken` to all requests
- Handles errors and redirects to login on 401
- Formats request/response data

### Example API calls:

```jsx
import communityService from '../services/communityService';

// Search communities
const results = await communityService.searchCommunities({
  search: 'green',
  lat: 19.0760,
  lng: 72.8777,
  maxDistance: 5000,
  city: 'Mumbai'
});

// Register community
const community = await communityService.registerCommunity({
  name: 'Green Valley',
  areaType: 'mohalla',
  description: 'A great community',
  latitude: 19.0760,
  longitude: 72.8777,
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  address: '123 Main St',
  population: 5000,
  coverImage: fileObject // Optional file
});

// Create activity
const activity = await communityService.createActivity(communityId, {
  title: 'Cleanup',
  description: 'Park cleanup',
  date: new Date(),
  location: 'Central Park',
  type: 'cleanup'
});
```

## 🎨 Customization

### Colors and Styling

All components use Tailwind CSS. To change colors, modify the className props:

```jsx
// Change button color
<button className="bg-red-500 hover:bg-red-600">Red Button</button>

// Change card style
<div className="bg-white rounded-lg shadow-lg p-6">Card</div>
```

### Component Props

Each component accepts various props. See component JSDoc comments for details.

## ❌ Common Issues & Solutions

### Issue: Routes not working
**Solution**: Make sure `CommunityRoutes` is imported with the wildcard path pattern:
```jsx
<Route path="/community/*" element={<CommunityRoutes />} />
```

### Issue: API calls failing
**Solution**: Check `.env` has correct API URL and backend is running on that port

### Issue: Styles not applied
**Solution**: Ensure Tailwind CSS is properly configured and imported in your main CSS file

### Issue: Geolocation not working
**Solution**: Make sure app is served over HTTPS (or localhost for development) and user grants permission

## 📋 Checklist

- [ ] Add CommunityRoutes to main App.jsx
- [ ] Set REACT_APP_API_URL in .env
- [ ] Ensure Tailwind CSS is configured
- [ ] Install required dependencies (axios, lucide-react)
- [ ] Add navigation links in navbar
- [ ] Test public pages working
- [ ] Test protected routes redirect to login
- [ ] Test API calls with backend
- [ ] Test form submissions and error handling
- [ ] Test geolocation functionality
- [ ] Test search and filters
- [ ] Test pagination on community list

## 🔄 Backend Requirements

Ensure your backend has these running:
- [ ] `/api/community` endpoints (GET, POST, PUT)
- [ ] `/api/community/search` endpoint (GET)
- [ ] `/api/community/:id/activities` endpoints
- [ ] `/api/community/:id/responsibilities` endpoints
- [ ] JWT authentication middleware
- [ ] File upload to S3 (for cover images)
- [ ] Error handling responses

## 📞 Support Files

For more details, refer to:
- Backend API doc: Check Backend/README.md or your API documentation
- Component docs: See JSDoc comments in component files
- Hook docs: See JSDoc comments in useCommunity.js

## 🚀 Next Steps

After integration:
1. Create remaining pages (ActivityDetail, ResponsibilityCreate, etc.)
2. Add map integration (Leaflet or Google Maps)
3. Add unit tests for components
4. Add E2E tests for user flows
5. Set up CI/CD pipeline
6. Deploy to production

---

**Last Updated**: March 18, 2026
**Version**: 1.0.0
