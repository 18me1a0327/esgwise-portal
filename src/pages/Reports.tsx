
import React, { useState } from "react";
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

      environmentalData.forEach(data => {
        const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
        if (submission) {
          csvData.push(
            `"${submission.site_name}","${format(new Date(submission.period_start), 'MMM yyyy')} - ${format(new Date(submission.period_end), 'MMM yyyy')}",${data.total_electricity || 0},${data.renewable_ppa || 0},${data.renewable_rooftop || 0},${data.coal_consumption || 0},${data.hsd_consumption || 0},${data.furnace_oil_consumption || 0},${data.petrol_consumption || 0},${data.total_emissions || 0},${data.water_withdrawal || 0},${data.wastewater_generated || 0},${data.total_waste || 0}`
          );
        }
      });
    } else if (activeTab === "social" && socialData.length > 0) {
      filename = "social_report.csv";
      csvData = [
        "Site,Period,Total Employees,Female Employees,Male Employees,New Hires,Attrition,Injuries,Fatalities,Workplace Complaints",
      ];

      socialData.forEach(data => {
        const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
        if (submission) {
          csvData.push(
            `"${submission.site_name}","${format(new Date(submission.period_start), 'MMM yyyy')} - ${format(new Date(submission.period_end), 'MMM yyyy')}",${data.total_employees || 0},${data.female_employees || 0},${data.male_employees || 0},${data.new_hires || 0},${data.attrition || 0},${data.injuries_employees || 0},${data.fatalities_employees || 0},${data.workplace_complaints || 0}`
          );
        }
      });
    } else if (activeTab === "governance" && governanceData.length > 0) {
      filename = "governance_report.csv";
      csvData = [
        "Site,Period,Board Members,Women Percentage,Legal Fines,Corruption Incidents,Cybersecurity Incidents",
      ];

      governanceData.forEach(data => {
        const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
        if (submission) {
          csvData.push(
            `"${submission.site_name}","${format(new Date(submission.period_start), 'MMM yyyy')} - ${format(new Date(submission.period_end), 'MMM yyyy')}",${data.board_members || 0},${data.women_percentage || 0},${data.legal_fines || 0},${data.corruption_incidents || 0},${data.cybersecurity_incidents || 0}`
          );
        }
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

  const formatPeriod = (startDate: string, endDate: string) => {
    return `${format(new Date(startDate), 'MMM yyyy')} - ${format(new Date(endDate), 'MMM yyyy')}`;
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
            {environmentalData.map(data => {
              const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
              if (!submission) return null;

              return (
                <TableRow key={data.id}>
                  <TableCell>{submission.site_name}</TableCell>
                  <TableCell>{formatPeriod(submission.period_start, submission.period_end)}</TableCell>
                  <TableCell>{data.total_electricity ? `${data.total_electricity} kWh` : '-'}</TableCell>
                  <TableCell>
                    {((data.renewable_ppa || 0) + (data.renewable_rooftop || 0)) > 0 
                      ? `${(data.renewable_ppa || 0) + (data.renewable_rooftop || 0)} kWh` 
                      : '-'}
                  </TableCell>
                  <TableCell>{data.total_emissions ? `${data.total_emissions} tCO₂e` : '-'}</TableCell>
                  <TableCell>{data.water_withdrawal ? `${data.water_withdrawal} kL` : '-'}</TableCell>
                  <TableCell>{data.total_waste ? `${data.total_waste} tons` : '-'}</TableCell>
                </TableRow>
              );
            })}
            {environmentalData.length === 0 && !isLoadingEnvironmental && (
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
            {socialData.map(data => {
              const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
              if (!submission) return null;

              return (
                <TableRow key={data.id}>
                  <TableCell>{submission.site_name}</TableCell>
                  <TableCell>{formatPeriod(submission.period_start, submission.period_end)}</TableCell>
                  <TableCell>{data.total_employees || '-'}</TableCell>
                  <TableCell>{data.female_employees || '-'}</TableCell>
                  <TableCell>{data.male_employees || '-'}</TableCell>
                  <TableCell>{data.new_hires || '-'}</TableCell>
                  <TableCell>{data.attrition || '-'}</TableCell>
                  <TableCell>{data.injuries_employees || '-'}</TableCell>
                  <TableCell>{data.workplace_complaints || '-'}</TableCell>
                </TableRow>
              );
            })}
            {socialData.length === 0 && !isLoadingSocial && (
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
            {governanceData.map(data => {
              const submission = approvedSubmissions.find(sub => sub.id === data.submission_id);
              if (!submission) return null;

              return (
                <TableRow key={data.id}>
                  <TableCell>{submission.site_name}</TableCell>
                  <TableCell>{formatPeriod(submission.period_start, submission.period_end)}</TableCell>
                  <TableCell>{data.board_members || '-'}</TableCell>
                  <TableCell>{data.women_percentage ? `${data.women_percentage}%` : '-'}</TableCell>
                  <TableCell>{data.legal_fines || '-'}</TableCell>
                  <TableCell>{data.corruption_incidents || '-'}</TableCell>
                  <TableCell>{data.cybersecurity_incidents || '-'}</TableCell>
                </TableRow>
              );
            })}
            {governanceData.length === 0 && !isLoadingGovernance && (
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
