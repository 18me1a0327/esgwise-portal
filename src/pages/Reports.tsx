
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchApprovedSubmissions } from "@/services/dashboardService";

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("environmental");
  
  const { data, isLoading } = useQuery({
    queryKey: ['approvedSubmissions'],
    queryFn: fetchApprovedSubmissions
  });

  const environmentalData = data?.environmentalData || [];
  const socialData = data?.socialData || [];
  const governanceData = data?.governanceData || [];

  const handleDownloadCSV = (tabName: string) => {
    let csvContent = "";
    let tableData: any[] = [];
    
    if (tabName === "environmental") {
      // Create headers
      csvContent = "Site,Period,Total Electricity,Renewable PPA,Renewable Rooftop,Total Emissions,NOx,SOx,PM,Water Withdrawal,Water Discharged\n";
      
      environmentalData.forEach(item => {
        csvContent += `"${item.submission.sites.name}","${item.submission.period_start} to ${item.submission.period_end}",${item.total_electricity || 0},${item.renewable_ppa || 0},${item.renewable_rooftop || 0},${item.total_emissions || 0},${item.nox || 0},${item.sox || 0},${item.pm || 0},${item.water_withdrawal || 0},${item.water_discharged || 0}\n`;
      });
    } else if (tabName === "social") {
      csvContent = "Site,Period,Total Employees,Male Employees,Female Employees,Injuries,Fatalities,Training Hours\n";
      
      socialData.forEach(item => {
        csvContent += `"${item.submission.sites.name}","${item.submission.period_start} to ${item.submission.period_end}",${item.total_employees || 0},${item.male_employees || 0},${item.female_employees || 0},${(item.injuries_employees || 0) + (item.injuries_workers || 0)},${(item.fatalities_employees || 0) + (item.fatalities_workers || 0)},${(item.ehs_training || 0) + (item.gmp_training || 0) + (item.other_training || 0)}\n`;
      });
    } else if (tabName === "governance") {
      csvContent = "Site,Period,Board Members,Women Percentage,Legal Fines,Cybersecurity Incidents,Corruption Incidents\n";
      
      governanceData.forEach(item => {
        csvContent += `"${item.submission.sites.name}","${item.submission.period_start} to ${item.submission.period_end}",${item.board_members || 0},${item.women_percentage || 0}%,${item.legal_fines || 0},${item.cybersecurity_incidents || 0},${item.corruption_incidents || 0}\n`;
      });
    }
    
    // Download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${tabName}_report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-esg-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ESG Reports</h1>
          <p className="text-gray-500">View and download approved ESG data reports</p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Back
        </Button>
      </div>

      <GlassCard className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadCSV(activeTab)}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              Download CSV
            </Button>
          </div>
          
          <TabsContent value="environmental" className="mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Reporting Period</TableHead>
                    <TableHead>Total Electricity (kWh)</TableHead>
                    <TableHead>Renewable PPA (kWh)</TableHead>
                    <TableHead>Renewable Rooftop (kWh)</TableHead>
                    <TableHead>Total Emissions (tCO₂e)</TableHead>
                    <TableHead>NOx (tonnes)</TableHead>
                    <TableHead>SOx (tonnes)</TableHead>
                    <TableHead>PM (tonnes)</TableHead>
                    <TableHead>Water Withdrawal (m³)</TableHead>
                    <TableHead>Water Discharged (m³)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environmentalData.length > 0 ? (
                    environmentalData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.submission.sites.name}</TableCell>
                        <TableCell>{`${item.submission.period_start} to ${item.submission.period_end}`}</TableCell>
                        <TableCell>{item.total_electricity || 0}</TableCell>
                        <TableCell>{item.renewable_ppa || 0}</TableCell>
                        <TableCell>{item.renewable_rooftop || 0}</TableCell>
                        <TableCell>{item.total_emissions || 0}</TableCell>
                        <TableCell>{item.nox || 0}</TableCell>
                        <TableCell>{item.sox || 0}</TableCell>
                        <TableCell>{item.pm || 0}</TableCell>
                        <TableCell>{item.water_withdrawal || 0}</TableCell>
                        <TableCell>{item.water_discharged || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        No approved environmental data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Reporting Period</TableHead>
                    <TableHead>Total Employees</TableHead>
                    <TableHead>Male Employees</TableHead>
                    <TableHead>Female Employees</TableHead>
                    <TableHead>Injuries</TableHead>
                    <TableHead>Fatalities</TableHead>
                    <TableHead>Training Hours</TableHead>
                    <TableHead>Workplace Complaints</TableHead>
                    <TableHead>Consumer Complaints</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {socialData.length > 0 ? (
                    socialData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.submission.sites.name}</TableCell>
                        <TableCell>{`${item.submission.period_start} to ${item.submission.period_end}`}</TableCell>
                        <TableCell>{item.total_employees || 0}</TableCell>
                        <TableCell>{item.male_employees || 0}</TableCell>
                        <TableCell>{item.female_employees || 0}</TableCell>
                        <TableCell>{(item.injuries_employees || 0) + (item.injuries_workers || 0)}</TableCell>
                        <TableCell>{(item.fatalities_employees || 0) + (item.fatalities_workers || 0)}</TableCell>
                        <TableCell>{(item.ehs_training || 0) + (item.gmp_training || 0) + (item.other_training || 0)}</TableCell>
                        <TableCell>{item.workplace_complaints || 0}</TableCell>
                        <TableCell>{item.consumer_complaints || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        No approved social data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="governance" className="mt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Reporting Period</TableHead>
                    <TableHead>Board Members</TableHead>
                    <TableHead>Women Percentage</TableHead>
                    <TableHead>Legal Fines</TableHead>
                    <TableHead>Cybersecurity Incidents</TableHead>
                    <TableHead>Corruption Incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {governanceData.length > 0 ? (
                    governanceData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.submission.sites.name}</TableCell>
                        <TableCell>{`${item.submission.period_start} to ${item.submission.period_end}`}</TableCell>
                        <TableCell>{item.board_members || 0}</TableCell>
                        <TableCell>{item.women_percentage || 0}%</TableCell>
                        <TableCell>{item.legal_fines || 0}</TableCell>
                        <TableCell>{item.cybersecurity_incidents || 0}</TableCell>
                        <TableCell>{item.corruption_incidents || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No approved governance data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>
    </div>
  );
};

export default Reports;
