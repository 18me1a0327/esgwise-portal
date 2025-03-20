
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  BarChart3Icon, 
  ClipboardCheckIcon, 
  HomeIcon,
  BuildingIcon,
  LogOutIcon,
  CheckSquareIcon,
  Settings2Icon,
  HelpCircleIcon,
  MenuIcon,
  XIcon,
  Users,
  Shield,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleAdmin = () => {
    setAdminOpen(!adminOpen);
  };

  const NavItem = ({ 
    to, 
    icon, 
    label,
    onClick
  }: { 
    to: string; 
    icon: React.ReactNode; 
    label: string;
    onClick?: () => void;
  }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
            "text-esg-gray-600 hover:bg-esg-gray-100",
            isActive && "bg-esg-blue/10 text-esg-blue font-medium",
            !expanded && "justify-center"
          )
        }
        onClick={() => {
          setMobileOpen(false);
          onClick && onClick();
        }}
      >
        {icon}
        {(expanded || mobileOpen) && <span>{label}</span>}
      </NavLink>
    );
  };

  const AdminButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all",
          "text-esg-gray-600 hover:bg-esg-gray-100",
          adminOpen && "bg-esg-gray-100 font-medium",
          !expanded && "justify-center"
        )}
      >
        <Shield size={20} />
        {(expanded || mobileOpen) && (
          <div className="flex flex-1 items-center justify-between">
            <span>Admin</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform", adminOpen ? "rotate-180" : "")}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white transition-all duration-300 ease-in-out lg:static lg:z-0",
          !expanded && "lg:w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex h-16 items-center justify-between border-b border-gray-100 px-4", !expanded && "lg:justify-center")}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-esg-blue font-bold text-white">
              ESG
            </div>
            {(expanded || mobileOpen) && (
              <span className="text-lg font-semibold">ESG Portal</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 focus:outline-none hidden lg:block"
          >
            {expanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <NavItem to="/" icon={<HomeIcon size={20} />} label="Home" />
            <NavItem to="/dashboard" icon={<BarChart3Icon size={20} />} label="Dashboard" />
            <NavItem to="/form" icon={<ClipboardCheckIcon size={20} />} label="Data Collection" />
            <NavItem to="/approvals" icon={<CheckSquareIcon size={20} />} label="Approval Queue" />
            
            {/* Admin Section */}
            <div className="pt-3">
              <AdminButton onClick={toggleAdmin} />
              {adminOpen && (expanded || mobileOpen) && (
                <div className="mt-1 space-y-1 pl-9">
                  <NavItem to="/admin/users" icon={<Users size={16} />} label="User Management" />
                  <NavItem to="/admin/sites" icon={<BuildingIcon size={16} />} label="Sites" />
                  <NavItem to="/admin/emission-factors" icon={<Database size={16} />} label="Emission Factors" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <NavItem to="/settings" icon={<Settings2Icon size={20} />} label="Settings" />
            <NavItem to="/help" icon={<HelpCircleIcon size={20} />} label="Help & Support" />
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-esg-gray-600 transition-all hover:bg-esg-gray-100",
              !expanded && "lg:justify-center"
            )}
          >
            <LogOutIcon size={20} />
            {(expanded || mobileOpen) && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
