
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layout components
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import PageTransition from "./components/Layout/PageTransition";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FormEntry from "./pages/FormEntry"; // Import FormEntry directly instead of lazy loading

// Lazy loaded pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ApprovalQueue = lazy(() => import("./pages/ApprovalQueue"));
const Reports = lazy(() => import("./pages/Reports"));
const Sites = lazy(() => import("./pages/Sites"));
const EmissionFactors = lazy(() => import("./pages/EmissionFactors"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ManageParameters = lazy(() => import("./pages/admin/ManageParameters"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6">
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                  <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                  <Route path="/form" element={<PageTransition><FormEntry /></PageTransition>} />
                  <Route path="/form/:id" element={<PageTransition><FormEntry /></PageTransition>} />
                  <Route path="/approvals" element={<PageTransition><ApprovalQueue /></PageTransition>} />
                  <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/sites" element={<PageTransition><Sites /></PageTransition>} />
                  <Route path="/admin/emission-factors" element={<PageTransition><EmissionFactors /></PageTransition>} />
                  <Route path="/admin/users" element={<PageTransition><UserManagement /></PageTransition>} />
                  <Route path="/admin/parameters" element={<PageTransition><ManageParameters /></PageTransition>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
