
import React from "react";
import { useLocation } from "react-router-dom";
import { BellIcon, SearchIcon, UserCircleIcon } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/dashboard':
        return 'Dashboard';
      case '/form':
        return 'Data Collection';
      case '/approvals':
        return 'Approval Queue';
      case '/admin/sites':
        return 'Site Management';
      case '/admin/emission-factors':
        return 'Emission Factors';
      case '/admin/users':
        return 'User Management';
      default:
        if (location.pathname.startsWith('/form/')) {
          return 'Edit Data Collection';
        }
        return 'ESG Portal';
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-600 outline-none focus:border-esg-blue focus:ring-1 focus:ring-esg-blue/20"
            />
          </div>
          
          <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-esg-red"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="hidden text-sm sm:block">
              <p className="font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
