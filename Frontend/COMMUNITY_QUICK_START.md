# 🚀 Community Feature - Quick Start Guide

Welcome! This guide will help you get the Community Feature up and running in your frontend application in just a few minutes.

## ⚡ 5-Minute Setup

### Step 1: Update Your Main Router (2 minutes)

Open your main `App.jsx` or `src/App.tsx` and find the Routes section:

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommunityRoutes from './routes/CommunityRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Add this line */}
        <Route path="/community/*" element={<CommunityRoutes />} />

        {/* More routes... */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 2: Set Environment Variable (1 minute)

Create or update `.env` file in your project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Add Navigation Links (1 minute)

Update your Navbar component:

```jsx
// components/Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold">NGO App</Link>
        
        <div className="flex gap-6">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/community" className="hover:text-blue-200">Communities</Link>
          <Link to="/community/register" className="hover:text-blue-200">Register Community</Link>
          {/* Other links */}
        </div>
      </div>
    </nav>
  );
}
```

### Step 4: Verify Installation (1 minute)

Run your development server:

```bash
npm run dev
# or
yarn dev
```

Navigate to `http://localhost:5173/community` (or your port) and you should see the Community List page!

---

## 📖 What You Now Have

### Public Pages (No Login Required)
- ✅ `/community` - Browse and search communities
- ✅ `/community/:id` - View community details and activities

### Community Leader Pages (Login Required)
- ✅ `/community/register` - Register a new community
- ✅ `/community/dashboard` - Manage your community
- ✅ `/community/:id/activities/create` - Create new activities

---

## 🎯 Common Tasks

### Task 1: Search Communities with Filters

```jsx
import { useCommunity } from '../hooks/useCommunity';

function SearchPage() {
  const { searchCommunities, communities, loading } = useCommunity();

  const handleSearch = async () => {
    await searchCommunities({
      search: 'green',
      city: 'Mumbai',
      state: 'Maharashtra',
      areaType: 'mohalla',
      lat: 19.0760,
      lng: 72.8777,
      maxDistance: 5000 // meters
    });
  };

  return (
    <div>
      <button onClick={handleSearch}>Search</button>
      {communities.map(c => <p key={c._id}>{c.name}</p>)}
    </div>
  );
}
```

### Task 2: Register a New Community

```jsx
import { useCommunity, useLocation } from '../hooks/useCommunity';
import { useNavigate } from 'react-router-dom';

function RegisterCommunity() {
  const { registerCommunity, loading, error } = useCommunity();
  const { latitude, longitude, getCurrentLocation } = useLocation();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const community = await registerCommunity({
        name: 'Green Valley',
        areaType: 'mohalla',
        description: 'A wonderful community',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        address: '123 Main Street',
        population: 5000,
        latitude,
        longitude,
        coverImage: null
      });
      
      navigate(`/community/${community._id}`);
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return (
    <button onClick={getCurrentLocation}>Get Location</button>
    <button onClick={handleRegister} disabled={loading}>Register</button>
  );
}
```

### Task 3: Create an Activity

```jsx
import { useActivity } from '../hooks/useCommunity';

function CreateActivity() {
  const communityId = 'community-123'; // Get from route or context
  const { createActivity, loading, error } = useActivity(communityId);

  const handleCreate = async () => {
    await createActivity({
      title: 'Monthly Cleanup',
      description: 'Clean up the community park',
      date: new Date('2024-03-25'),
      time: '10:00',
      location: 'Community Park',
      type: 'cleanup'
    });
  };

  return <button onClick={handleCreate}>Create Activity</button>;
}
```

### Task 4: List Community Activities

```jsx
import { useActivity } from '../hooks/useCommunity';
import { useEffect } from 'react';
import ActivityCard from '../components/community/ActivityCard';

function ActivitiesList() {
  const communityId = 'community-123';
  const { activities, fetchActivities, loading } = useActivity(communityId);

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid gap-4">
      {activities.map(activity => (
        <ActivityCard key={activity._id} activity={activity} communityId={communityId} />
      ))}
    </div>
  );
}
```

---

## 🔒 Protected Routes

To protect routes so only logged-in users can access them:

```jsx
// routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}

// Usage in CommunityRoutes.jsx
<Route
  path="/register"
  element={
    <ProtectedRoute isAuthenticated={!!localStorage.getItem('authToken')}>
      <CommunityRegister />
    </ProtectedRoute>
  }
/>
```

---

## 🎨 Customizing Components

### Change Button Colors

```jsx
// components/community/CommunityCard.jsx - line 60
- <button className="bg-blue-500 hover:bg-blue-600">
+ <button className="bg-green-500 hover:bg-green-600">
```

### Change Card Styling

```jsx
// Any component
- <div className="bg-white rounded-lg shadow-md">
+ <div className="bg-gray-50 rounded-xl shadow-lg border border-gray-200">
```

### Add Custom Colors

In your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1E40AF',
        'brand-green': '#15803D',
      }
    }
  }
}
```

Then use in components:
```jsx
<button className="bg-brand-blue hover:bg-brand-green">Custom Color</button>
```

---

## ✅ Testing the Integration

### Test 1: Check Routes Work
1. Go to `http://localhost:5173/community` ✓
2. Should see the community list page ✓

### Test 2: Check API Connection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on a community or search
4. Check network requests go to your backend ✓

### Test 3: Check Error Handling
1. Disconnect from internet or stop backend
2. Try to search communities
3. Should show error message ✓

### Test 4: Check Styling
1. Check if colors match your design ✓
2. Test responsive layout on mobile ✓
3. Test dark mode if applicable ✓

---

## 📊 File Summary

| File | Lines | Purpose |
|------|-------|---------|
| communityService.js | 350+ | API communication |
| useCommunity.js | 400+ | State management hooks |
| CommunityRoutes.jsx | 50 | Route configuration |
| CommunityList.jsx | 180 | Public listing page |
| CommunityDetail.jsx | 250 | Detail view page |
| CommunityRegister.jsx | 320 | Registration form |
| CommunityLeaderDashboard.jsx | 280 | Leader dashboard |
| ActivityCreate.jsx | 250 | Create activity form |
| Components | 150 each | Reusable UI components |

**Total**: 2000+ lines of production-ready code

---

## 🆘 Troubleshooting

### Problem: "CommunityRoutes is not defined"
```
Solution: Check that you imported it correctly
import CommunityRoutes from './routes/CommunityRoutes';
```

### Problem: API requests returning 404
```
Solution: Make sure REACT_APP_API_URL is correct in .env
Check backend is running on that port
```

### Problem: Tailwind styling not showing
```
Solution: Ensure tailwind.config.js includes your source files:
content: ["./src/**/*.{js,jsx,ts,tsx}"]
```

### Problem: "Cannot find module 'lucide-react'"
```
Solution: Install missing package:
npm install lucide-react
```

### Problem: Geolocation always fails
```
Solution: Browser needs HTTPS or localhost
Make sure user grants permission when prompted
```

---

## 📚 Next Steps

1. **Test all features** - Try every page and function
2. **Add missing pages** - Create ActivityDetail, ResponsibilityCreate pages
3. **Add map integration** - Use Leaflet to show communities on map
4. **Add authentication** - Implement login/signup if not done
5. **Deploy frontend** - Push to production
6. **Monitor errors** - Check logs for issues

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [React Router Guide](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com)

---

## 💡 Pro Tips

1. **Use React DevTools**: Install React DevTools extension for better debugging
2. **Use Responsive Design**: Test on mobile using Chrome DevTools (F12 → Device Toolbar)
3. **Check Console Errors**: F12 → Console tab shows any JavaScript errors
4. **Network Inspection**: F12 → Network tab to see API requests/responses
5. **Component Composition**: Reuse components across different pages

---

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review component JSDoc comments
3. Check browser console for errors
4. Check network requests in DevTools
5. Review Backend API documentation

---

**Ready to build! 🚀**

Start with:
```bash
npm run dev
```

Then navigate to `/community` and explore the feature!

---

*Last Updated: March 18, 2026*
*Community Feature v1.0.0*
