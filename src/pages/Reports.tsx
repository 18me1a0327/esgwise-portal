
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, FileDown, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GlassCard from "@/components/ui/GlassCard";
import {
  getReportSites,
  getApprovedSubmissions,
  getEnvironmentalReportData,
  getSocialReportData,
  getGovernanceReportData,
  ReportSite,
  ApprovedSubmission,
  ReportEnvironmentalData,
  ReportSocialData,
  ReportGovernanceData,
} from "@/services/reportService";

// Helper type for consolidated data
type ConsolidatedData = {
  siteId: string;
  siteName: string;
  periodMonth: string;
  periodYear: string;
  displayPeriod: string;
  submissions: ApprovedSubmission[];
  environmentalData?: ReportEnvironmentalData[];
  socialData?: ReportSocialData[];
  governanceData?: ReportGovernanceData[];
};

const Reports = () => {
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("environmental");

  // Fetch sites for filter dropdown
  const { data: sites = [] } = useQuery({
    queryKey: ["reportSites"],
    queryFn: getReportSites,
  });

  // Fetch approved submissions based on selected site
  const { 
    data: approvedSubmissions = [],
    isLoading: isLoadingSubmissions
  } = useQuery({
    queryKey: ["approvedSubmissions", selectedSiteId],
    queryFn: () => getApprovedSubmissions(selectedSiteId),
  });

  // Extract submission IDs for data queries
  const submissionIds = approvedSubmissions.map(sub => sub.id);

  // Fetch environmental data for approved submissions
  const { 
    data: environmentalData = [],
    isLoading: isLoadingEnvironmental
  } = useQuery({
    queryKey: ["environmentalReportData", submissionIds],
    queryFn: () => getEnvironmentalReportData(submissionIds),
    enabled: submissionIds.length > 0 && activeTab === "environmental",
  });

  // Fetch social data for approved submissions
  const { 
    data: socialData = [],
    isLoading: isLoadingSocial
  } = useQuery({
    queryKey: ["socialReportData", submissionIds],
    queryFn: () => getSocialReportData(submissionIds),
    enabled: submissionIds.length > 0 && activeTab === "social",
  });

  // Fetch governance data for approved submissions
  const { 
    data: governanceData = [],
    isLoading: isLoadingGovernance
  } = useQuery({
    queryKey: ["governanceReportData", submissionIds],
    queryFn: () => getGovernanceReportData(submissionIds),
    enabled: submissionIds.length > 0 && activeTab === "governance",
  });

  // Consolidate data by site and month
  const consolidatedData = useMemo(() => {
    const dataMap = new Map<string, ConsolidatedData>();
    
    approvedSubmissions.forEach(submission => {
      const periodDate = new Date(submission.period_start);
      const month = periodDate.getMonth();
      const year = periodDate.getFullYear();
      const key = `${submission.site_id}-${month}-${year}`;
      
      if (!dataMap.has(key)) {
        dataMap.set(key, {
          siteId: submission.site_id,
          siteName: submission.site_name,
          periodMonth: format(periodDate, 'MMM'),
          periodYear: format(periodDate, 'yyyy'),
          displayPeriod: format(periodDate, 'MMM yyyy'),
          submissions: [],
          environmentalData: [],
          socialData: [],
          governanceData: []
        });
      }
      
      const entry = dataMap.get(key)!;
      entry.submissions.push(submission);
    });
    
    // Associate environmental data with consolidated entries
    environmentalData.forEach(data => {
      const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
      if (submission) {
        const periodDate = new Date(submission.period_start);
        const month = periodDate.getMonth();
        const year = periodDate.getFullYear();
        const key = `${submission.site_id}-${month}-${year}`;
        
        if (dataMap.has(key)) {
          const entry = dataMap.get(key)!;
          if (!entry.environmentalData) {
            entry.environmentalData = [];
          }
          entry.environmentalData.push(data);
        }
      }
    });
    
    // Associate social data with consolidated entries
    socialData.forEach(data => {
      const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
      if (submission) {
        const periodDate = new Date(submission.period_start);
        const month = periodDate.getMonth();
        const year = periodDate.getFullYear();
        const key = `${submission.site_id}-${month}-${year}`;
        
        if (dataMap.has(key)) {
          const entry = dataMap.get(key)!;
          if (!entry.socialData) {
            entry.socialData = [];
          }
          entry.socialData.push(data);
        }
      }
    });
    
    // Associate governance data with consolidated entries
    governanceData.forEach(data => {
      const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
      if (submission) {
        const periodDate = new Date(submission.period_start);
        const month = periodDate.getMonth();
        const year = periodDate.getFullYear();
        const key = `${submission.site_id}-${month}-${year}`;
        
        if (dataMap.has(key)) {
          const entry = dataMap.get(key)!;
          if (!entry.governanceData) {
            entry.governanceData = [];
          }
          entry.governanceData.push(data);
        }
      }
    });
    
    return Array.from(dataMap.values());
  }, [approvedSubmissions, environmentalData, socialData, governanceData]);

  const handleSiteChange = (value: string) => {
    setSelectedSiteId(value === "all" ? undefined : value);
  };

  const handleDownloadCSV = () => {
    let csvData: string[] = [];
    let filename = "";

    if (activeTab === "environmental" && environmentalData.length > 0) {
      filename = "environmental_report.csv";
      csvData = [
        "Site,Period,Total Electricity,Renewable PPA,Renewable Rooftop,Coal Consumption,HSD Consumption,Furnace Oil,Petrol,Total Emissions,Water Withdrawal,Wastewater,Total Waste",
      ];

      // Group by site and month for CSV export
      consolidatedData.forEach(group => {
        // Calculate averages or sums as needed
        const totalElectricity = group.environmentalData?.reduce((sum, data) => sum + (data.total_electricity || 0), 0) || 0;
        const renewablePpa = group.environmentalData?.reduce((sum, data) => sum + (data.renewable_ppa || 0), 0) || 0;
        const renewableRooftop = group.environmentalData?.reduce((sum, data) => sum + (data.renewable_rooftop || 0), 0) || 0;
        const coalConsumption = group.environmentalData?.reduce((sum, data) => sum + (data.coal_consumption || 0), 0) || 0;
        const hsdConsumption = group.environmentalData?.reduce((sum, data) => sum + (data.hsd_consumption || 0), 0) || 0;
        const furnaceOil = group.environmentalData?.reduce((sum, data) => sum + (data.furnace_oil_consumption || 0), 0) || 0;
        const petrol = group.environmentalData?.reduce((sum, data) => sum + (data.petrol_consumption || 0), 0) || 0;
        const totalEmissions = group.environmentalData?.reduce((sum, data) => sum + (data.total_emissions || 0), 0) || 0;
        const waterWithdrawal = group.environmentalData?.reduce((sum, data) => sum + (data.water_withdrawal || 0), 0) || 0;
        const wastewater = group.environmentalData?.reduce((sum, data) => sum + (data.wastewater_generated || 0), 0) || 0;
        const totalWaste = group.environmentalData?.reduce((sum, data) => sum + (data.total_waste || 0), 0) || 0;
        
        csvData.push(
          `"${group.siteName}","${group.displayPeriod}",${totalElectricity},${renewablePpa},${renewableRooftop},${coalConsumption},${hsdConsumption},${furnaceOil},${petrol},${totalEmissions},${waterWithdrawal},${wastewater},${totalWaste}`
        );
      });
    } else if (activeTab === "social" && socialData.length > 0) {
      filename = "social_report.csv";
      csvData = [
        "Site,Period,Total Employees,Female Employees,Male Employees,New Hires,Attrition,Injuries,Fatalities,Workplace Complaints",
      ];

      consolidatedData.forEach(group => {
        const totalEmployees = group.socialData?.reduce((sum, data) => sum + (data.total_employees || 0), 0) || 0;
        const femaleEmployees = group.socialData?.reduce((sum, data) => sum + (data.female_employees || 0), 0) || 0;
        const maleEmployees = group.socialData?.reduce((sum, data) => sum + (data.male_employees || 0), 0) || 0;
        const newHires = group.socialData?.reduce((sum, data) => sum + (data.new_hires || 0), 0) || 0;
        const attrition = group.socialData?.reduce((sum, data) => sum + (data.attrition || 0), 0) || 0;
        const injuries = group.socialData?.reduce((sum, data) => sum + (data.injuries_employees || 0), 0) || 0;
        const fatalities = group.socialData?.reduce((sum, data) => sum + (data.fatalities_employees || 0), 0) || 0;
        const complaints = group.socialData?.reduce((sum, data) => sum + (data.workplace_complaints || 0), 0) || 0;
        
        csvData.push(
          `"${group.siteName}","${group.displayPeriod}",${totalEmployees},${femaleEmployees},${maleEmployees},${newHires},${attrition},${injuries},${fatalities},${complaints}`
        );
      });
    } else if (activeTab === "governance" && governanceData.length > 0) {
      filename = "governance_report.csv";
      csvData = [
        "Site,Period,Board Members,Women Percentage,Legal Fines,Corruption Incidents,Cybersecurity Incidents",
      ];

      consolidatedData.forEach(group => {
        const boardMembers = group.governanceData?.reduce((sum, data) => sum + (data.board_members || 0), 0) || 0;
        const womenPercentage = group.governanceData?.length ? 
          group.governanceData.reduce((sum, data) => sum + (data.women_percentage || 0), 0) / group.governanceData.length : 0;
        const legalFines = group.governanceData?.reduce((sum, data) => sum + (data.legal_fines || 0), 0) || 0;
        const corruptionIncidents = group.governanceData?.reduce((sum, data) => sum + (data.corruption_incidents || 0), 0) || 0;
        const cybersecurityIncidents = group.governanceData?.reduce((sum, data) => sum + (data.cybersecurity_incidents || 0), 0) || 0;
        
        csvData.push(
          `"${group.siteName}","${group.displayPeriod}",${boardMembers},${womenPercentage.toFixed(2)},${legalFines},${corruptionIncidents},${cybersecurityIncidents}`
        );
      });
    }

    if (csvData.length > 0) {
      const csvContent = "data:text/csv;charset=utf-8," + csvData.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper functions to calculate aggregated values for each consolidated group
  const getAggregatedEnvironmentalData = (group: ConsolidatedData) => {
    if (!group.environmentalData || group.environmentalData.length === 0) return null;
    
    return {
      total_electricity: group.environmentalData.reduce((sum, data) => sum + (data.total_electricity || 0), 0),
      renewable_energy: group.environmentalData.reduce((sum, data) => sum + ((data.renewable_ppa || 0) + (data.renewable_rooftop || 0)), 0),
      total_emissions: group.environmentalData.reduce((sum, data) => sum + (data.total_emissions || 0), 0),
      water_withdrawal: group.environmentalData.reduce((sum, data) => sum + (data.water_withdrawal || 0), 0),
      total_waste: group.environmentalData.reduce((sum, data) => sum + (data.total_waste || 0), 0),
    };
  };

  const getAggregatedSocialData = (group: ConsolidatedData) => {
    if (!group.socialData || group.socialData.length === 0) return null;
    
    return {
      total_employees: group.socialData.reduce((sum, data) => sum + (data.total_employees || 0), 0),
      female_employees: group.socialData.reduce((sum, data) => sum + (data.female_employees || 0), 0),
      male_employees: group.socialData.reduce((sum, data) => sum + (data.male_employees || 0), 0),
      new_hires: group.socialData.reduce((sum, data) => sum + (data.new_hires || 0), 0),
      attrition: group.socialData.reduce((sum, data) => sum + (data.attrition || 0), 0),
      injuries_employees: group.socialData.reduce((sum, data) => sum + (data.injuries_employees || 0), 0),
      workplace_complaints: group.socialData.reduce((sum, data) => sum + (data.workplace_complaints || 0), 0),
    };
  };

  const getAggregatedGovernanceData = (group: ConsolidatedData) => {
    if (!group.governanceData || group.governanceData.length === 0) return null;
    
    // For percentage values, we calculate the average
    const count = group.governanceData.length;
    
    return {
      board_members: group.governanceData.reduce((sum, data) => sum + (data.board_members || 0), 0),
      women_percentage: group.governanceData.reduce((sum, data) => sum + (data.women_percentage || 0), 0) / count,
      legal_fines: group.governanceData.reduce((sum, data) => sum + (data.legal_fines || 0), 0),
      corruption_incidents: group.governanceData.reduce((sum, data) => sum + (data.corruption_incidents || 0), 0),
      cybersecurity_incidents: group.governanceData.reduce((sum, data) => sum + (data.cybersecurity_incidents || 0), 0),
    };
  };

  const renderEnvironmentalTable = () => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Electricity</TableHead>
              <TableHead>Renewable Energy</TableHead>
              <TableHead>Total Emissions</TableHead>
              <TableHead>Water Withdrawal</TableHead>
              <TableHead>Total Waste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consolidatedData.map((group, index) => {
              const aggregatedData = getAggregatedEnvironmentalData(group);
              if (!aggregatedData) return null;

              return (
                <TableRow key={`${group.siteId}-${group.periodMonth}-${group.periodYear}-${index}`}>
                  <TableCell>{group.siteName}</TableCell>
                  <TableCell>{group.displayPeriod}</TableCell>
                  <TableCell>{aggregatedData.total_electricity ? `${aggregatedData.total_electricity.toLocaleString()} kWh` : '-'}</TableCell>
                  <TableCell>{aggregatedData.renewable_energy > 0 ? `${aggregatedData.renewable_energy.toLocaleString()} kWh` : '-'}</TableCell>
                  <TableCell>{aggregatedData.total_emissions ? `${aggregatedData.total_emissions.toLocaleString()} tCO₂e` : '-'}</TableCell>
                  <TableCell>{aggregatedData.water_withdrawal ? `${aggregatedData.water_withdrawal.toLocaleString()} kL` : '-'}</TableCell>
                  <TableCell>{aggregatedData.total_waste ? `${aggregatedData.total_waste.toLocaleString()} tons` : '-'}</TableCell>
                </TableRow>
              );
            })}
            {consolidatedData.length === 0 && !isLoadingEnvironmental && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No environmental data available for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderSocialTable = () => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Employees</TableHead>
              <TableHead>Female Employees</TableHead>
              <TableHead>Male Employees</TableHead>
              <TableHead>New Hires</TableHead>
              <TableHead>Attrition</TableHead>
              <TableHead>Injuries</TableHead>
              <TableHead>Complaints</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consolidatedData.map((group, index) => {
              const aggregatedData = getAggregatedSocialData(group);
              if (!aggregatedData) return null;

              return (
                <TableRow key={`${group.siteId}-${group.periodMonth}-${group.periodYear}-${index}`}>
                  <TableCell>{group.siteName}</TableCell>
                  <TableCell>{group.displayPeriod}</TableCell>
                  <TableCell>{aggregatedData.total_employees || '-'}</TableCell>
                  <TableCell>{aggregatedData.female_employees || '-'}</TableCell>
                  <TableCell>{aggregatedData.male_employees || '-'}</TableCell>
                  <TableCell>{aggregatedData.new_hires || '-'}</TableCell>
                  <TableCell>{aggregatedData.attrition || '-'}</TableCell>
                  <TableCell>{aggregatedData.injuries_employees || '-'}</TableCell>
                  <TableCell>{aggregatedData.workplace_complaints || '-'}</TableCell>
                </TableRow>
              );
            })}
            {consolidatedData.length === 0 && !isLoadingSocial && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                  No social data available for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderGovernanceTable = () => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Board Members</TableHead>
              <TableHead>Women Percentage</TableHead>
              <TableHead>Legal Fines</TableHead>
              <TableHead>Corruption Incidents</TableHead>
              <TableHead>Cybersecurity Incidents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consolidatedData.map((group, index) => {
              const aggregatedData = getAggregatedGovernanceData(group);
              if (!aggregatedData) return null;

              return (
                <TableRow key={`${group.siteId}-${group.periodMonth}-${group.periodYear}-${index}`}>
                  <TableCell>{group.siteName}</TableCell>
                  <TableCell>{group.displayPeriod}</TableCell>
                  <TableCell>{aggregatedData.board_members || '-'}</TableCell>
                  <TableCell>{aggregatedData.women_percentage ? `${aggregatedData.women_percentage.toFixed(2)}%` : '-'}</TableCell>
                  <TableCell>{aggregatedData.legal_fines || '-'}</TableCell>
                  <TableCell>{aggregatedData.corruption_incidents || '-'}</TableCell>
                  <TableCell>{aggregatedData.cybersecurity_incidents || '-'}</TableCell>
                </TableRow>
              );
            })}
            {consolidatedData.length === 0 && !isLoadingGovernance && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No governance data available for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const isLoading = isLoadingSubmissions || 
    (activeTab === "environmental" && isLoadingEnvironmental) ||
    (activeTab === "social" && isLoadingSocial) ||
    (activeTab === "governance" && isLoadingGovernance);

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">ESG Reports</h1>
          <p className="text-gray-500">View and export approved ESG data by category</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex-1 flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <Select value={selectedSiteId || "all"} onValueChange={handleSiteChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((site: ReportSite) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            className="flex gap-2"
            onClick={handleDownloadCSV}
            disabled={
              (activeTab === "environmental" && environmentalData.length === 0) ||
              (activeTab === "social" && socialData.length === 0) ||
              (activeTab === "governance" && governanceData.length === 0) ||
              isLoading
            }
          >
            <FileDown size={16} />
            Download CSV
          </Button>
        </div>
      </div>

      <GlassCard className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-background border">
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <Loader2 size={36} className="animate-spin mb-4" />
              <p>Loading report data...</p>
            </div>
          ) : (
            <>
              <TabsContent value="environmental">
                {renderEnvironmentalTable()}
              </TabsContent>
              <TabsContent value="social">
                {renderSocialTable()}
              </TabsContent>
              <TabsContent value="governance">
                {renderGovernanceTable()}
              </TabsContent>
            </>
          )}
        </Tabs>
      </GlassCard>
    </div>
  );
};

export default Reports;
