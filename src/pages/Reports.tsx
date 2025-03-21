
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileSpreadsheet, Filter } from "lucide-react";
import { fetchApprovedSubmissionsData } from "@/services/reportService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Reports = () => {
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['reportsData'],
    queryFn: fetchApprovedSubmissionsData
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-pulse">Loading reports data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-red-500">Error loading report data: {error.toString()}</div>
      </div>
    );
  }

  if (!data || (data.environmentalData.length === 0 && data.socialData.length === 0 && data.governanceData.length === 0)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Reports Available</CardTitle>
            <CardDescription>
              There are no approved submissions to generate reports from.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get all unique site names for filter
  const sites = Array.from(new Set(data.submissions.map(sub => sub.sites?.name || 'Unknown')));

  // Filter data based on selected site
  const filteredEnvData = siteFilter 
    ? data.environmentalData.filter(item => item.submission.sites?.name === siteFilter)
    : data.environmentalData;
    
  const filteredSocialData = siteFilter
    ? data.socialData.filter(item => item.submission.sites?.name === siteFilter)
    : data.socialData;
    
  const filteredGovData = siteFilter
    ? data.governanceData.filter(item => item.submission.sites?.name === siteFilter)
    : data.governanceData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">ESG Reports</h1>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select
              value={siteFilter || ""}
              onValueChange={(value) => setSiteFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="environmental" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="environmental">Environmental Data</TabsTrigger>
          <TabsTrigger value="social">Social Data</TabsTrigger>
          <TabsTrigger value="governance">Governance Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="environmental" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Energy & Emissions</CardTitle>
              <CardDescription>
                Electricity consumption and emissions data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Electricity (kWh)</TableHead>
                    <TableHead>Renewable Energy (kWh)</TableHead>
                    <TableHead>Coal (tons)</TableHead>
                    <TableHead>HSD (liters)</TableHead>
                    <TableHead>Total Emissions (tCO2e)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnvData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.total_electricity || 0}</TableCell>
                      <TableCell>{(item.renewable_ppa || 0) + (item.renewable_rooftop || 0)}</TableCell>
                      <TableCell>{item.coal_consumption || 0}</TableCell>
                      <TableCell>{item.hsd_consumption || 0}</TableCell>
                      <TableCell>{item.total_emissions || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Air Emissions</CardTitle>
              <CardDescription>
                Pollutant emissions data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>NOx (tons)</TableHead>
                    <TableHead>SOx (tons)</TableHead>
                    <TableHead>PM (tons)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnvData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.nox || 0}</TableCell>
                      <TableCell>{item.sox || 0}</TableCell>
                      <TableCell>{item.pm || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Water Management</CardTitle>
              <CardDescription>
                Water consumption and discharge data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Withdrawal (kL)</TableHead>
                    <TableHead>Third Party (kL)</TableHead>
                    <TableHead>Rainwater (kL)</TableHead>
                    <TableHead>Recycled (kL)</TableHead>
                    <TableHead>Discharged (kL)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnvData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.water_withdrawal || 0}</TableCell>
                      <TableCell>{item.third_party_water || 0}</TableCell>
                      <TableCell>{item.rainwater || 0}</TableCell>
                      <TableCell>{item.recycled_wastewater || 0}</TableCell>
                      <TableCell>{item.water_discharged || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Waste Management</CardTitle>
              <CardDescription>
                Waste generation and disposal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Hazardous (tons)</TableHead>
                    <TableHead>Non-hazardous (tons)</TableHead>
                    <TableHead>Plastic (tons)</TableHead>
                    <TableHead>E-waste (tons)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnvData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.total_hazardous || 0}</TableCell>
                      <TableCell>{item.non_hazardous || 0}</TableCell>
                      <TableCell>{item.plastic_waste || 0}</TableCell>
                      <TableCell>{item.e_waste || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workforce Demographics</CardTitle>
              <CardDescription>
                Employee diversity and workforce data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Employees</TableHead>
                    <TableHead>Male Employees</TableHead>
                    <TableHead>Female Employees</TableHead>
                    <TableHead>Contract Male</TableHead>
                    <TableHead>Contract Female</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSocialData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.total_employees || 0}</TableCell>
                      <TableCell>{item.male_employees || 0}</TableCell>
                      <TableCell>{item.female_employees || 0}</TableCell>
                      <TableCell>{item.contract_male || 0}</TableCell>
                      <TableCell>{item.contract_female || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health & Safety</CardTitle>
              <CardDescription>
                Workplace safety and incident data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Employee Injuries</TableHead>
                    <TableHead>Worker Injuries</TableHead>
                    <TableHead>Employee Fatalities</TableHead>
                    <TableHead>Worker Fatalities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSocialData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.injuries_employees || 0}</TableCell>
                      <TableCell>{item.injuries_workers || 0}</TableCell>
                      <TableCell>{item.fatalities_employees || 0}</TableCell>
                      <TableCell>{item.fatalities_workers || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training & Development</CardTitle>
              <CardDescription>
                Employee training and benefits data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>EHS Training (%)</TableHead>
                    <TableHead>GMP Training (%)</TableHead>
                    <TableHead>Other Training (%)</TableHead>
                    <TableHead>PF Coverage (%)</TableHead>
                    <TableHead>ESI Coverage (%)</TableHead>
                    <TableHead>Health Insurance (%)</TableHead>
                    <TableHead>Parental Benefits (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSocialData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.ehs_training || 0}</TableCell>
                      <TableCell>{item.gmp_training || 0}</TableCell>
                      <TableCell>{item.other_training || 0}</TableCell>
                      <TableCell>{item.pf_coverage || 0}</TableCell>
                      <TableCell>{item.esi_coverage || 0}</TableCell>
                      <TableCell>{item.health_insurance || 0}</TableCell>
                      <TableCell>{item.parental_benefits || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Board Composition</CardTitle>
              <CardDescription>
                Board diversity and age distribution data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Board Members</TableHead>
                    <TableHead>Women Percentage (%)</TableHead>
                    <TableHead>Under 30 (%)</TableHead>
                    <TableHead>30-50 (%)</TableHead>
                    <TableHead>Above 50 (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGovData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.board_members || 0}</TableCell>
                      <TableCell>{item.women_percentage || 0}</TableCell>
                      <TableCell>{item.board_under30 || 0}</TableCell>
                      <TableCell>{item.board_30to50 || 0}</TableCell>
                      <TableCell>{item.board_above50 || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience Distribution</CardTitle>
              <CardDescription>
                Board experience distribution data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Under 5 Years (%)</TableHead>
                    <TableHead>5-10 Years (%)</TableHead>
                    <TableHead>Above 10 Years (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGovData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.exp_under5 || 0}</TableCell>
                      <TableCell>{item.exp_5to10 || 0}</TableCell>
                      <TableCell>{item.exp_above10 || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk & Compliance</CardTitle>
              <CardDescription>
                Legal, corruption and cybersecurity incident data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Legal Fines</TableHead>
                    <TableHead>Corruption Incidents</TableHead>
                    <TableHead>Cybersecurity Incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGovData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.submission.sites?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(item.submission.period_start), 'MMM yyyy')} - 
                        {format(new Date(item.submission.period_end), 'MMM yyyy')}
                      </TableCell>
                      <TableCell>{item.legal_fines || 0}</TableCell>
                      <TableCell>{item.corruption_incidents || 0}</TableCell>
                      <TableCell>{item.cybersecurity_incidents || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
