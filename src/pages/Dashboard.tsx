
import React, { useState } from "react";
import { 
  BarChart3Icon, 
  Droplets, 
  Leaf, 
  Users, 
  Briefcase, 
  Loader2,
  LockIcon,
  GavelIcon,
  Wind
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import GlassCard from "@/components/ui/GlassCard";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import ProgressRing from "@/components/Dashboard/ProgressRing";
import CarbonEmissionsChart from "@/components/Dashboard/CarbonEmissionsChart";
import TimelineEnergyChart from "@/components/Dashboard/TimelineEnergyChart";
import TimelineChart from "@/components/Dashboard/TimelineChart";
import FugitiveEmissionsChart from "@/components/Dashboard/FugitiveEmissionsChart";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fetchDashboardData } from "@/services/dashboardService";
import { fetchSites } from "@/services/siteService";

const Dashboard = () => {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("quarter");

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboardData', selectedSite, timeframe],
    queryFn: () => fetchDashboardData(selectedSite, timeframe)
  });

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6'];
  const WATER_COLORS = ['#0A84FF', '#64D2FF', '#5E5CE6', '#30D158', '#BF5AF2'];
  const WASTE_COLORS = ['#FF453A', '#FF9F0A', '#FFD60A', '#5E5CE6', '#BF5AF2', '#32D74B'];

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
  const wasteData = dashboardData?.chartData?.wasteData || [];
  const carbonEmissionsData = dashboardData?.chartData?.carbonEmissionsData || [];
  const fugitiveEmissionsData = dashboardData?.fugitiveEmissionsData || [];

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

  const socialMetricsData = dashboardData?.socialData?.map(item => {
    const date = item.submission?.period_start || '';
    const dateObj = new Date(date);
    const monthAbbr = dateObj.toLocaleString('default', { month: 'short' });
    const yearShort = dateObj.getFullYear().toString().slice(2);
    const displayDate = `${monthAbbr}'${yearShort}`;
    
    return {
      name: item.submission?.sites?.name || 'Unknown',
      date,
      displayDate,
      period: `${new Date(item.submission?.period_start).toLocaleDateString()} - ${new Date(item.submission?.period_end).toLocaleDateString()}`,
      'Health Insurance': Number(item.health_insurance) || 0,
      'Accident Insurance': Number(item.accident_insurance) || 0,
      'Parental Benefits': Number(item.parental_benefits) || 0,
      'PF Coverage': Number(item.pf_coverage) || 0,
      'Gratuity': Number(item.gratuity_coverage) || 0,
      'ESI': Number(item.esi_coverage) || 0,
    };
  }) || [];

  const govData = dashboardData?.governanceData || [];
  
  const calcAverage = (arr, field) => {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
    return sum / arr.length;
  };

  const womenPercentage = calcAverage(govData, 'women_percentage');
  const boardUnder30 = calcAverage(govData, 'board_under30');
  const board30to50 = calcAverage(govData, 'board_30to50');
  const boardAbove50 = calcAverage(govData, 'board_above50');
  
  const expUnder5 = calcAverage(govData, 'exp_under5');
  const exp5to10 = calcAverage(govData, 'exp_5to10');
  const expAbove10 = calcAverage(govData, 'exp_above10');
  
  const totalCyberIncidents = govData.reduce((sum, item) => sum + (Number(item.cybersecurity_incidents) || 0), 0);
  const totalCorruptionIncidents = govData.reduce((sum, item) => sum + (Number(item.corruption_incidents) || 0), 0);
  const totalLegalFines = govData.reduce((sum, item) => sum + (Number(item.legal_fines) || 0), 0);
  
  // Fix for the error - properly accessing workplace_complaints and consumer_complaints
  const workplaceComplaints = dashboardData?.socialData?.reduce((sum, item) => 
    sum + (Number(item.workplace_complaints) || 0), 0) || 0;
  
  const consumerComplaints = dashboardData?.socialData?.reduce((sum, item) => 
    sum + (Number(item.consumer_complaints) || 0), 0) || 0;
  
  const resolutionRate = 85;

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
              value={govData.length ? "75/100" : "0/100"}
              valueClassName="text-amber-500"
              icon={<Briefcase size={20} />}
              change={{ value: 2, positive: true }}
            >
              <ProgressRing progress={govData.length ? 75 : 0} size={60} strokeWidth={6} color="#FF9F0A">
                <span className="text-sm font-semibold">{govData.length ? 75 : 0}%</span>
              </ProgressRing>
            </DashboardCard>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Environmental Metrics</h2>
          <div className="grid grid-cols-1 gap-6 mb-6">
            <CarbonEmissionsChart data={carbonEmissionsData} />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <TimelineEnergyChart data={energyData} />
          </div>
          
          {dashboardData?.fugitiveEmissionsData && (
            <div className="grid grid-cols-1 gap-6 mb-6">
              <FugitiveEmissionsChart data={dashboardData.fugitiveEmissionsData} />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimelineChart 
              title="Air Emissions (MT)"
              data={emissionsData}
              dataKeys={["NOx", "SOx", "PM", "Others"]}
              colors={["#FF453A", "#FF9F0A", "#5E5CE6", "#BF5AF2"]}
              chartType="line"
              unit="MT"
            />
            
            <TimelineChart 
              title="Water Management (KL)"
              subtitle="Water withdrawal and discharge over time"
              data={waterData}
              dataKeys={["Withdrawal", "ThirdParty", "Rainwater", "Recycled", "Discharged"]}
              colors={WATER_COLORS}
              chartType="area"
              unit="KL"
            />
            
            <TimelineChart 
              title="Waste Management (MT)"
              subtitle="Waste generation by category over time"
              data={wasteData}
              dataKeys={["Hazardous", "NonHazardous", "Plastic", "EWaste", "BioMedical", "WasteOil"]}
              colors={WASTE_COLORS}
              unit="MT"
            />
          </div>
        </motion.div>
        
        <motion.div variants={item} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Social Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Workforce Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Employee Benefits Coverage (%)</h3>
              <div className="h-[300px]">
                <TimelineChart 
                  title=""
                  data={socialMetricsData}
                  dataKeys={['Health Insurance', 'Accident Insurance', 'Parental Benefits', 'PF Coverage', 'Gratuity', 'ESI']}
                  colors={COLORS}
                  chartType="line"
                  unit="%"
                />
              </div>
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
                    <span className="text-sm font-medium">{womenPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-esg-blue h-2 rounded-full" style={{ width: `${womenPercentage}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Board by Age Group</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{"<30"}</p>
                      <p className="text-base font-medium">{boardUnder30.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">30-50</p>
                      <p className="text-base font-medium">{board30to50.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{">50"}</p>
                      <p className="text-base font-medium">{boardAbove50.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Board by Experience</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{"<5 yrs"}</p>
                      <p className="text-base font-medium">{expUnder5.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">5-10 yrs</p>
                      <p className="text-base font-medium">{exp5to10.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">{">10 yrs"}</p>
                      <p className="text-base font-medium">{expAbove10.toFixed(1)}%</p>
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
                  <p className="text-2xl font-semibold">{totalCyberIncidents}</p>
                  <p className="text-xs text-gray-500 mt-1">All incidents promptly addressed</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <GavelIcon size={18} className="text-esg-blue mr-2" />
                    <p className="text-sm font-medium">Corruption Incidents</p>
                  </div>
                  <p className="text-2xl font-semibold text-esg-green">{totalCorruptionIncidents}</p>
                  <p className="text-xs text-gray-500 mt-1">Zero tolerance policy enforced</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <GavelIcon size={18} className="text-esg-blue mr-2" />
                    <p className="text-sm font-medium">Legal Fines (USD)</p>
                  </div>
                  <p className="text-2xl font-semibold">${totalLegalFines.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Regulatory compliance monitored</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-5" hoverable>
              <h3 className="text-base font-medium mb-4">Complaints & Resolution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Workplace Complaints</span>
                    <span className="text-sm font-medium">{workplaceComplaints}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(workplaceComplaints * 10, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Consumer Complaints</span>
                    <span className="text-sm font-medium">{consumerComplaints}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-esg-green h-2 rounded-full" style={{ width: `${Math.min(consumerComplaints * 10, 100)}%` }}></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Resolution Rate</p>
                      <p className="text-xs text-gray-500">Average time: 7 days</p>
                    </div>
                    <ProgressRing progress={resolutionRate} size={60} strokeWidth={6} color="#0A84FF">
                      <span className="text-sm font-semibold">{resolutionRate}%</span>
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
