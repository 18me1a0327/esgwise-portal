
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMobileContext } from "@/hooks/use-mobile";
import { BarChart, FileText, Users, MapPin, Settings, BarChart2, ClipboardList, FileSpreadsheet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Sidebar = () => {
  const location = useLocation();
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobileContext();

  // If sidebar is closed on mobile, don't render
  if (isMobile && !isSidebarOpen) {
    return null;
  }

  return (
    <Card className={cn(
      "h-full rounded-none border-r shadow-none",
      isMobile ? "absolute z-40 w-64" : "w-64"
    )}>
      <CardContent className="flex h-full flex-col items-start gap-2 p-0">
        <div className="flex h-14 w-full items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            <span className="font-semibold">ESG Reporting</span>
          </Link>
        </div>
        <div className="flex-1 space-y-1 p-4">
          <Link 
            to="/dashboard" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname === '/dashboard' && "bg-muted"
            )}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            to="/form" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname.includes('/form') && "bg-muted"
            )}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Submit Data
          </Link>
          <Link 
            to="/approvals" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname === '/approvals' && "bg-muted"
            )}
          >
            <FileText className="mr-2 h-4 w-4" />
            Approvals
          </Link>
          <Link 
            to="/reports" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname === '/reports' && "bg-muted"
            )}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Reports
          </Link>
          
          <div className="py-2">
            <div className="text-xs font-semibold text-muted-foreground">
              Administration
            </div>
          </div>
          
          <Link 
            to="/admin/sites" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname === '/admin/sites' && "bg-muted"
            )}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Sites
          </Link>
          <Link 
            to="/admin/emission-factors" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname === '/admin/emission-factors' && "bg-muted"
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Emission Factors
          </Link>
          <Link 
            to="/admin/users" 
            onClick={isMobile ? toggleSidebar : undefined}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start",
              location.pathname === '/admin/users' && "bg-muted"
            )}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Sidebar;
