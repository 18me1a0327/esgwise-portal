
import React, { useState } from "react";
import { 
  BarChart3Icon, 
  BarChart4Icon, 
  Droplets, 
  Leaf, 
  Recycle, 
  Users, 
  Heart, 
  DollarSign, 
  GraduationCap, 
  Shield, 
  MessageSquare, 
  Briefcase, 
  Lock, 
  Gavel
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import ProgressRing from "@/components/Dashboard/ProgressRing";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockESGData, mockSites } from "@/types/esg";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("quarter");

  // Environmental data summary
  const energyData = [
    { name: 'Electricity', value: 150000 },
    { name: 'Renewable', value: 60000 },
    { name: 'Coal', value: 200 },
    { name: 'Fossil Fuels', value: 9000 },
  ];

  const emissionsData = [
    { name: 'NOx', value: 50 },
    { name: 'SOx', value: 30 },
    { name: 'PM', value: 20 },
    { name: 'Others', value: 30 },
  ];

  const waterData = [
    { name: 'Withdrawal', value: 50000 },
    { name: 'Third-party', value: 20000 },
    { name: 'Rainwater', value: 5000 },
    { name: 'Recycled', value: 15000 },
    { name: 'Discharged', value: 10000 },
  ];

  const wasteData = [
    { name: 'Hazardous', value: 180 },
    { name: 'Non-hazardous', value: 500 },
    { name: 'Plastic', value: 200 },
    { name: 'E-waste', value: 15 },
    { name: 'Bio-medical', value: 20 },
    { name: 'Waste oil', value: 25 },
  ];

  // Social data summary
  const employeeData = [
    { name: 'Male Employees', value: 350 },
    { name: 'Female Employees', value: 150 },
    { name: 'Contract Male', value: 100 },
    { name: 'Contract Female', value: 50 },
  ];

  const benefitsData = [
    { name: 'Health Insurance', value: 100 },
    { name: 'Accident Insurance', value: 100 },
    { name: 'Parental Benefits', value: 100 },
    { name: 'PF Coverage', value: 100 },
    { name: 'Gratuity', value: 100 },
    { name: 'ESI', value: 40 },
  ];

  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6'];

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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">ESG Performance Dashboard</h1>
          <p className="text-gray-500">Track and analyze your environmental, social, and governance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {mockSites.map(site => (
                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="ESG Score"
              value="72/100"
              valueClassName="text-esg-blue"
              icon={<BarChart3Icon size={20} />}
              change={{ value: 5, positive: true }}
            >
              <ProgressRing progress={72} size={60} strokeWidth={6} color="#0A84FF">
                <span className="text-sm font-semibold">72%</span>
              </ProgressRing>
            </DashboardCard>
            
            <DashboardCard
              title="Environmental Score"
              value="68/100"
              valueClassName="text-esg-green"
              icon={<Leaf size={20} />}
              change={{ value: 3, positive: true }}
            >
              <ProgressRing progress={68} size={60} strokeWidth={6} color="#30D158">
                <span className="text-sm font-semibold">68%</span>
              </ProgressRing>
            </DashboardCard>
            
            <DashboardCard
              title="Social Score"
              value="78/100"
              valueClassName="text-esg-purple"
              icon={<Users size={20} />}
              change={{ value: 7, positive: true }}
            >
              <ProgressRing progress={78} size={60} strokeWidth={6} color="#BF5AF2">
                <span className="text-sm font-semibold">78%</span>
              </ProgressRing>
            </DashboardCard>
            
            <DashboardCard
              title="Governance Score"
              value="75/100"
              valueClassName="text-amber-500"
              icon={<Briefcase size={20} />}
              change={{ value: 2, positive: true }}
            >
              <ProgressRing progress={75} size={60} strokeWidth={6} color="#FF9F0A">
                <span className="text-sm font-semibold">75%</span>
              </ProgressRing>
            </DashboardCard>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Environmental Metrics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Energy Consumption</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Air Emissions (MT)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emissionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FF453A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Water Management (KL)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Waste Management (MT)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Social Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Workforce Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={employeeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {employeeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Employee Benefits Coverage (%)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benefitsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#BF5AF2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Workplace Safety</h3>
              <div className="flex flex-col h-full justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Reportable Incidents</p>
                    <p className="text-xl font-semibold">5</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Recordable Injuries</p>
                    <p className="text-xl font-semibold">3</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Fatalities</p>
                    <p className="text-xl font-semibold text-esg-green">0</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Man-Hours Worked</p>
                    <p className="text-xl font-semibold">1.5M</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Safety Performance</p>
                    <p className="text-base font-medium">Strong</p>
                  </div>
                  <ProgressRing progress={92} size={60} strokeWidth={6} color="#30D158">
                    <span className="text-sm font-semibold">92%</span>
                  </ProgressRing>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
        
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold mb-4">Governance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Board Composition</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Women on Board</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-esg-blue h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Board by Age Group</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{"<30"}</p>
                      <p className="text-base font-medium">0%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">30-50</p>
                      <p className="text-base font-medium">40%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{">50"}</p>
                      <p className="text-base font-medium">60%</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Board by Experience</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{"<5 yrs"}</p>
                      <p className="text-base font-medium">10%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">5-10 yrs</p>
                      <p className="text-base font-medium">30%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{">10 yrs"}</p>
                      <p className="text-base font-medium">60%</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Cybersecurity & Ethics</h3>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lock size={18} className="text-esg-blue mr-2" />
                    <p className="text-sm font-medium">Cybersecurity Incidents</p>
                  </div>
                  <p className="text-2xl font-semibold">1</p>
                  <p className="text-xs text-gray-500 mt-1">All incidents promptly addressed</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Gavel size={18} className="text-esg-blue mr-2" />
                    <p className="text-sm font-medium">Corruption Incidents</p>
                  </div>
                  <p className="text-2xl font-semibold text-esg-green">0</p>
                  <p className="text-xs text-gray-500 mt-1">Zero tolerance policy enforced</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Complaints & Resolution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Workplace Complaints</span>
                    <span className="text-sm font-medium">5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Consumer Complaints</span>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-esg-green h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Resolution Rate</p>
                      <p className="text-xs text-gray-500">Average time: 7 days</p>
                    </div>
                    <ProgressRing progress={85} size={60} strokeWidth={6} color="#0A84FF">
                      <span className="text-sm font-semibold">85%</span>
                    </ProgressRing>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
