import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogOut, User, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  // Don't show full nav on public evaluation pages
  if (location.pathname.startsWith('/evaluate/')) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Heart className="h-8 w-8 text-brand-600 mr-2" />
              <span className="font-bold text-xl text-gray-900">LoveCheck</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Heart className="h-8 w-8 text-brand-600 mr-2" />
              <span className="font-bold text-xl text-gray-900">LoveCheck</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-500 hover:text-brand-600 flex items-center px-3 py-2 rounded-md text-sm font-medium">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center">
                   <span className="text-sm text-gray-700 mr-4 hidden sm:block">Hi, {user.name.split(' ')[0]}</span>
                   <button onClick={handleSignOut} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                     <LogOut className="h-5 w-5" />
                   </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};