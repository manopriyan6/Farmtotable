import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, User, LogOut, Scan, Package, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force navigation with replace to prevent back button issues
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Still navigate even if there's an error
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors">
              <Sprout className="h-8 w-8" />
              <span className="text-xl font-bold">FarmConnect</span>
            </Link>

            {user && profile && (
              <nav className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{profile.full_name}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs capitalize">
                    {profile.role}
                  </span>
                </div>

                {profile.role === 'farmer' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                        location.pathname === '/dashboard'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/products"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                        location.pathname === '/products'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      <Package className="h-4 w-4" />
                      <span>Products</span>
                    </Link>
                  </>
                )}

                {profile.role === 'customer' && (
                  <Link
                    to="/scanner"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                      location.pathname === '/scanner'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    <Scan className="h-4 w-4" />
                    <span>Scan QR</span>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};