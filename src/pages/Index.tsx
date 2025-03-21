
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3Icon, 
  ClipboardCheckIcon,
  CheckSquareIcon,
  Lightbulb,
  Settings,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="container max-w-6xl px-4 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-1.5 px-3 mb-4 bg-esg-blue/10 text-esg-blue text-xs font-medium rounded-full">
          <Lightbulb size={14} className="mr-1.5" />
          ESG Data Management Portal
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Streamline Your ESG Data <span className="text-esg-blue">Workflow</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Collect, approve, and visualize your environmental, social, and governance metrics in one unified platform.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <GlassCard 
            className="p-6 h-full flex flex-col items-center text-center cursor-pointer"
            hoverable
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-esg-blue mb-4">
              <BarChart3Icon size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Dashboard</h3>
            <p className="text-gray-600 text-sm">View interactive visualizations and track your ESG performance</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard 
            className="p-6 h-full flex flex-col items-center text-center cursor-pointer"
            hoverable
            onClick={() => navigate("/form")}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-esg-green mb-4">
              <ClipboardCheckIcon size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Data Collection</h3>
            <p className="text-gray-600 text-sm">Submit structured ESG data across environmental, social, and governance categories</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard 
            className="p-6 h-full flex flex-col items-center text-center cursor-pointer"
            hoverable
            onClick={() => navigate("/approvals")}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
              <CheckSquareIcon size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Approval Queue</h3>
            <p className="text-gray-600 text-sm">Review and approve submitted data before it's added to the dashboard</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard 
            className="p-6 h-full flex flex-col items-center text-center cursor-pointer"
            hoverable
            onClick={() => navigate("/admin/users")}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-esg-purple mb-4">
              <Settings size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Admin</h3>
            <p className="text-gray-600 text-sm">Manage users, sites, and emission factors</p>
          </GlassCard>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <Button 
          onClick={() => navigate("/form")} 
          className="bg-esg-blue hover:bg-esg-blue/90 text-white"
          size="lg"
        >
          Start Data Collection
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-16 bg-gray-50 rounded-xl p-6 md:p-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-esg-blue mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path><path d="M3 16v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path><path d="M3 7h18"></path><path d="M3 16h18"></path><path d="M9 12h6"></path><path d="M12 15V9"></path></svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Structured Data Collection</h3>
            <p className="text-sm text-gray-600">Capture data across environmental, social, and governance parameters</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-esg-blue mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Approval Workflow</h3>
            <p className="text-sm text-gray-600">Multi-stage approval process ensures data quality and compliance</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-esg-blue mb-3 shadow-sm border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="8" rx="2"></rect><path d="M7 8v8"></path><path d="M17 8v8"></path><path d="M3 12h18"></path><path d="M12 8v8"></path></svg>
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Interactive Dashboard</h3>
            <p className="text-sm text-gray-600">Visualize ESG metrics with customizable charts and insights</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
