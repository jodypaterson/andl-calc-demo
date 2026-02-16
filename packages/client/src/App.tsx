import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages';
import { ProtectedRoute } from './components/auth';

/**
 * App - Root application component with routing configuration
 * 
 * Routes:
 * - /login (public) - Login page
 * - /register (public) - Registration page 
 * - /calculator (public) - Calculator page
 * - /dashboard (protected) - Main dashboard
 * - /profile (protected) - User profile  
 * - /settings (protected) - User settings
 * - / (redirect) - Redirects to /login
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * RegisterPage - Placeholder registration page component
 * TODO: Implement full registration UI in future ATP
 */
function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Register</h1>
        <p className="text-gray-600">
          Registration page placeholder. Sign-up UI will be implemented in a future ATP.
        </p>
      </div>
    </div>
  );
}

/**
 * CalculatorPage - Placeholder calculator page component
 * TODO: Implement calculator UI in future ATP
 */
function CalculatorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="glass w-full max-w-2xl rounded-2xl p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Calculator</h1>
        <p className="text-gray-600">
          Calculator page placeholder. Calculation UI will be implemented in a future ATP.
        </p>
      </div>
    </div>
  );
}

/**
 * ProfilePage - Placeholder profile page component  
 * TODO: Implement profile UI in future ATP
 */
function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-4 text-gray-600">
        Profile page placeholder. User profile UI will be implemented in a future ATP.
      </p>
    </div>
  );
}

/**
 * SettingsPage - Placeholder settings page component
 * TODO: Implement settings UI in future ATP  
 */
function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-4 text-gray-600">
        Settings page placeholder. User settings UI will be implemented in a future ATP.
      </p>
    </div>
  );
}

export default App;
