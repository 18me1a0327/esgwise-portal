import React, { useState } from "react";
import { 
  BarChart3Icon, 
  Droplets, 
  Leaf, 
  Users, 
  Briefcase, 
  Loader2,
  LockIcon,
  GavelIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "@/components/ui/GlassCard";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import ProgressRing from "@/components/Dashboard/ProgressRing";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchDashboardData } from "@/services/dashboardService";
import { fetchSites } from "@/services/siteService";

const Dashboard = () => {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("quarter");

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboardData', selectedSite, timeframe],
    queryFn: fetchDashboardData
  });

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

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

  if (isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-lg text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  const energyData = dashboardData?.chartData?.energyData || [];
  const emissionsData = dashboardData?.chartData?.emissionsData || [];
  const waterData = dashboardData?.chartData?.waterData || [];
  const wasteData = dashboardData?.environmentalData?.map(item => [
    { name: 'Hazardous', value: Number(item.total_hazardous) || 0 },
    { name: 'Non-hazardous', value: Number(item.non_hazardous) || 0 },
    { name: 'Plastic', value: Number(item.plastic_waste) || 0 },
    { name: 'E-waste', value: Number(item.e_waste) || 0 },
    { name: 'Bio-medical', value: Number(item.bio_medical) || 0 },
    { name: 'Waste oil', value: Number(item.waste_oil) || 0 },
  ]).flat() || [];

  const employeeData = dashboardData?.socialData?.map(item => [
    { name: 'Male Employees', value: Number(item.male_employees) || 0 },
    { name: 'Female Employees', value: Number(item.female_employees) || 0 },
    { name: 'Contract Male', value: Number(item.contract_male) || 0 },
    { name: 'Contract Female', value: Number(item.contract_female) || 0 },
  ]).flat() || [];

  const benefitsData = dashboardData?.socialData?.map(item => [
    { name: 'Health Insurance', value: Number(item.health_insurance) || 0 },
    { name: 'Accident Insurance', value: Number(item.accident_insurance) || 0 },
    { name: 'Parental Benefits', value: Number(item.parental_benefits) || 0 },
    { name: 'PF Coverage', value: Number(item.pf_coverage) || 0 },
    { name: 'Gratuity', value: Number(item.gratuity_coverage) || 0 },
    { name: 'ESI', value: Number(item.esi_coverage) || 0 },
  ]).flat() || [];

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
              {sites?.map(site => (
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
              value={`${Math.round((dashboardData?.renewablePercentage || 0) * 0.72)}/100`}
              valueClassName="text-esg-blue"
              icon={<BarChart3Icon size={20} />}
              change={{ value: 5, positive: true }}
            >
              <ProgressRing progress={Math.round((dashboardData?.renewablePercentage || 0) * 0.72)} size={60} strokeWidth={6} color="#0A84FF">
                <span className="text-sm font-semibold">{Math.round((dashboardData?.renewablePercentage || 0) * 0.72)}%</span>
              </ProgressRing>
            </DashboardCard>
            
            <DashboardCard
              title="Environmental Score"
              value={`${Math.round((dashboardData?.renewablePercentage || 0) * 0.68)}/100`}
              valueClassName="text-esg-green"
              icon={<Leaf size={20} />}
              change={{ value: 3, positive: true }}
            >
              <ProgressRing progress={Math.round((dashboardData?.renewablePercentage || 0) * 0.68)} size={60} strokeWidth={6} color="#30D158">
                <span className="text-sm font-semibold">{Math.round((dashboardData?.renewablePercentage || 0) * 0.68)}%</span>
              </ProgressRing>
            </DashboardCard>
            
            <DashboardCard
              title="Social Score"
              value={dashboardData?.socialData?.length ? "78/100" : "0/100"}
              valueClassName="text-esg-purple"
              icon={<Users size={20} />}
              change={{ value: 7, positive: true }}
            >
              <ProgressRing progress={dashboardData?.socialData?.length ? 78 : 0} size={60} strokeWidth={6} color="#BF5AF2">
                <span className="text-sm font-semibold">{dashboardData?.socialData?.length ? 78 : 0}%</span>
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
              {energyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalElectricity" name="Electricity" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="renewableEnergy" name="Renewable" fill="#30D158" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coal" name="Coal" fill="#FF9F0A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fossilFuels" name="Fossil Fuels" fill="#FF453A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No energy consumption data available
                </div>
              )}
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Air Emissions (MT)</h3>
              {emissionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={emissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="NOx" name="NOx" fill="#FF453A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="SOx" name="SOx" fill="#FF9F0A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="PM" name="PM" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Others" name="Others" fill="#BF5AF2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No air emissions data available
                </div>
              )}
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Water Management (KL)</h3>
              {waterData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Withdrawal" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ThirdParty" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Rainwater" fill="#30D158" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Recycled" fill="#FF9F0A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Discharged" fill="#BF5AF2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No water management data available
                </div>
              )}
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Waste Management (MT)</h3>
              {wasteData.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  No waste management data available
                </div>
              )}
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
                    <LockIcon size={18} className="text-esg-blue mr-2" />
                    <p className="text-sm font-medium">Cybersecurity Incidents</p>
                  </div>
                  <p className="text-2xl font-semibold">1</p>
                  <p className="text-xs text-gray-500 mt-1">All incidents promptly addressed</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <GavelIcon size={18} className="text-esg-blue mr-2" />
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
