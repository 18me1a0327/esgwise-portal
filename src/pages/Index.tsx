
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, ClipboardCheck, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

const Index = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'View ESG performance metrics and analytics',
      icon: <BarChart3 size={24} className="text-esg-blue" />,
      path: '/dashboard'
    },
    {
      title: 'Data Entry',
      description: 'Submit new ESG data for your sites',
      icon: <ClipboardCheck size={24} className="text-esg-green" />,
      path: '/form'
    },
    {
      title: 'Reports',
      description: 'Generate and download ESG reports',
      icon: <FileSpreadsheet size={24} className="text-esg-purple" />,
      path: '/reports'
    },
    {
      title: 'Admin',
      description: 'Manage users, sites, and approval workflows',
      icon: <ShieldCheck size={24} className="text-esg-orange" />,
      path: '/approvals'
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ESG Data Management System</h1>
        <p className="text-xl text-gray-600 mb-2">
          Track, analyze, and report on your organization's environmental, social, and governance metrics
        </p>
        <p className="text-gray-500">
          Choose an option below to get started
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(item.path)}
            className="cursor-pointer"
          >
            <GlassCard className="p-6 h-full transition-all hover:shadow-md hover:border-esg-blue/30">
              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;
