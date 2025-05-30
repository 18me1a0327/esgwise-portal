
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Leaf, 
  Users, 
  Briefcase, 
  ChevronRight, 
  ChevronDown, 
  Save, 
  Send, 
  ArrowLeft,
  PlusCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchSites } from "@/services/siteService";
import { createSubmission, saveAsDraft, fetchSubmissionDetails } from "@/services/esgSubmissionService";
import { useESGParameters, isESGStructureLoaded } from "@/hooks/useESGParameters";
import { ESGParameterStructure } from "@/services/parameterService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = ["2022", "2023", "2024", "2025", "2026"];

const REPORTING_SPANS = ["Monthly", "Quarterly", "Annually"];

interface EnvironmentalData {
  [key: string]: number | undefined;
}

interface SocialData {
  [key: string]: number | undefined;
}

interface GovernanceData {
  [key: string]: number | undefined;
}

interface SubmissionDetails {
  submission: {
    id: string;
    site_id: string;
    period_start: string;
    period_end: string;
    submitted_by: string;
    status: string;
    created_at: string;
  };
  environmentalData: EnvironmentalData;
  socialData: SocialData;
  governanceData: GovernanceData;
}

const FormEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();

  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [reportingSpan, setReportingSpan] = useState<string>("Monthly");
  const [submitterName, setSubmitterName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState("environmental");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formData, setFormData] = useState({
    environmental: {} as EnvironmentalData,
    social: {} as SocialData,
    governance: {} as GovernanceData
  });

  // Load ESG parameters from the Manage Parameters page
  const { data: esgStructure, isLoading: isESGStructureLoading } = useESGParameters();
  const structureLoaded = isESGStructureLoaded(esgStructure);

  const { data: sites, isLoading: isSitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  const { data: submissionDetails, isLoading: isSubmissionLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => fetchSubmissionDetails(id as string),
    enabled: isEditMode
  });

  const submitMutation = useMutation({
    mutationFn: (isDraft: boolean) => {
      let periodStart, periodEnd;
      
      const year = parseInt(selectedYear);
      const monthIndex = MONTHS.indexOf(selectedMonth);
      
      if (reportingSpan === "Monthly" && monthIndex !== -1) {
        periodStart = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-01`;
        
        const lastDay = new Date(year, monthIndex + 1, 0).getDate();
        periodEnd = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${lastDay}`;
      } else if (reportingSpan === "Quarterly") {
        const quarter = Math.floor(monthIndex / 3);
        const startMonth = quarter * 3 + 1;
        const endMonth = startMonth + 2;
        
        periodStart = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
        
        const lastDay = new Date(year, endMonth, 0).getDate();
        periodEnd = `${year}-${endMonth.toString().padStart(2, '0')}-${lastDay}`;
      } else {
        periodStart = `${year}-01-01`;
        periodEnd = `${year}-12-31`;
      }
      
      if (isDraft) {
        return saveAsDraft(
          selectedSite,
          periodStart,
          periodEnd,
          submitterName,
          formData.environmental,
          formData.social,
          formData.governance
        );
      } else {
        return createSubmission(
          selectedSite,
          periodStart,
          periodEnd,
          submitterName,
          formData.environmental,
          formData.social,
          formData.governance
        );
      }
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables ? "Draft saved successfully!" : "ESG data submitted for approval",
        description: variables ? "You can continue editing later." : "Your data has been submitted and is pending approval.",
        duration: 5000,
      });
      if (!variables) {
        navigate("/approvals");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  });

  const [calculatedEmissions, setCalculatedEmissions] = useState({
    electricity: 0,
    coal: 0,
    hsd: 0,
    furnaceOil: 0,
    petrol: 0,
    total: 0
  });

  useEffect(() => {
    if (isEditMode && submissionDetails) {
      const { submission, environmentalData, socialData, governanceData } = submissionDetails;
      
      setSelectedSite(submission.site_id);
      
      const startDate = new Date(submission.period_start);
      setSelectedMonth(MONTHS[startDate.getMonth()]);
      setSelectedYear(startDate.getFullYear().toString());
      
      const periodStart = new Date(submission.period_start);
      const periodEnd = new Date(submission.period_end);
      const monthDiff = (periodEnd.getFullYear() - periodStart.getFullYear()) * 12 
                         + periodEnd.getMonth() - periodStart.getMonth() + 1;
      
      if (monthDiff === 1) {
        setReportingSpan("Monthly");
      } else if (monthDiff === 3) {
        setReportingSpan("Quarterly");
      } else {
        setReportingSpan("Annually");
      }
      
      setSubmitterName(submission.submitted_by);
      
      setFormData({
        environmental: environmentalData || {},
        social: socialData || {},
        governance: governanceData || {}
      });
    }
  }, [isEditMode, submissionDetails]);

  // Set initial category when ESG structure is loaded
  useEffect(() => {
    if (structureLoaded && esgStructure) {
      // Set initial selected category to first available category in the active tab
      const categoryType = activeTab as keyof ESGParameterStructure;
      const categories = Object.keys(esgStructure[categoryType] || {});
      
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [structureLoaded, esgStructure, activeTab, selectedCategory]);

  useEffect(() => {
    const EMISSION_FACTORS = {
      electricity: 0.82,
      coal: 2.42,
      hsd: 2.68,
      furnaceOil: 3.15,
      petrol: 2.3
    };

    const envData = formData.environmental;
    
    const totalElectricity = Number(envData.total_electricity) || 0;
    const iRecs = Number(envData.i_recs) || 0;
    const marketBasedElectricity = Math.max(0, totalElectricity - iRecs);
    
    const electricityEmissions = marketBasedElectricity * EMISSION_FACTORS.electricity;
    const coalEmissions = (Number(envData.coal_consumption) || 0) * EMISSION_FACTORS.coal * 1000;
    const hsdEmissions = (Number(envData.hsd_consumption) || 0) * EMISSION_FACTORS.hsd * 1000;
    const furnaceOilEmissions = (Number(envData.furnace_oil_consumption) || 0) * EMISSION_FACTORS.furnaceOil * 1000;
    const petrolEmissions = (Number(envData.petrol_consumption) || 0) * EMISSION_FACTORS.petrol * 1000;
    
    const totalEmissions = electricityEmissions + coalEmissions + hsdEmissions + furnaceOilEmissions + petrolEmissions;
    
    setCalculatedEmissions({
      electricity: electricityEmissions / 1000,
      coal: coalEmissions / 1000,
      hsd: hsdEmissions / 1000,
      furnaceOil: furnaceOilEmissions / 1000,
      petrol: petrolEmissions / 1000,
      total: totalEmissions / 1000
    });
  }, [formData.environmental]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSite) {
      toast({
        title: "Error",
        description: "Please select a site location",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedMonth && reportingSpan === "Monthly") {
      toast({
        title: "Error",
        description: "Please select a month",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedYear) {
      toast({
        title: "Error",
        description: "Please select a year",
        variant: "destructive",
      });
      return;
    }
    
    if (!submitterName) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(false);
  };

  const handleSaveDraft = () => {
    if (!selectedSite) {
      toast({
        title: "Error",
        description: "Please select a site location",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedYear) {
      toast({
        title: "Error",
        description: "Please select a year",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(true);
  };

  const updateFormData = (category: 'environmental' | 'social' | 'governance', id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: value === '' ? null : Number(value)
      }
    }));
  };

  // Get categories for the active tab from esgStructure
  const getCurrentCategories = () => {
    if (!structureLoaded || !esgStructure) return [];
    
    const categoryType = activeTab as keyof ESGParameterStructure;
    return Object.keys(esgStructure[categoryType] || {});
  };

  // Get parameters for the selected category from esgStructure
  const getCurrentParameters = () => {
    if (!structureLoaded || !esgStructure || !selectedCategory) return [];
    
    const categoryType = activeTab as keyof ESGParameterStructure;
    return esgStructure[categoryType]?.[selectedCategory]?.parameters || [];
  };

  if (isSubmissionLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-lg text-gray-600">Loading submission data...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ESG Data Collection</h1>
          <p className="text-gray-500">Record environmental, social, and governance metrics for sustainability reporting</p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-3">
            <div>
              <Label htmlFor="site">Site Location</Label>
              {isSitesLoading ? (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Loading sites...
                </div>
              ) : (
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger id="site" className="mt-1">
                    <SelectValue placeholder="Select site location" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites && sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={reportingSpan !== "Monthly"}>
                <SelectTrigger id="month" className="mt-1">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year" className="mt-1">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reporting-span">Reporting Span</Label>
              <Select value={reportingSpan} onValueChange={setReportingSpan}>
                <SelectTrigger id="reporting-span" className="mt-1">
                  <SelectValue placeholder="Select reporting span" />
                </SelectTrigger>
                <SelectContent>
                  {REPORTING_SPANS.map(span => (
                    <SelectItem key={span} value={span}>
                      {span}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="submitter">Submitted By</Label>
              <Input 
                id="submitter" 
                placeholder="Your name" 
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="environmental" className="flex items-center gap-2">
                <Leaf size={16} />
                <span>Environmental</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Users size={16} />
                <span>Social</span>
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center gap-2">
                <Briefcase size={16} />
                <span>Governance</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              <Label htmlFor="subcategory">Category</Label>
              {isESGStructureLoading ? (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Loading categories...
                </div>
              ) : (
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="subcategory" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Parameters</h3>
              
              {isESGStructureLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : getCurrentParameters().length > 0 ? (
                <div className="space-y-4">
                  {getCurrentParameters().map(param => (
                    <div key={param.id} className="flex items-center border-b border-gray-100 pb-3">
                      <div className="mr-2">
                        <PlusCircle size={18} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={param.id} className="font-medium">
                          {param.name}
                          {param.unit && (
                            <span className="text-xs text-gray-500 block mt-0.5">
                              {param.unit}
                            </span>
                          )}
                        </Label>
                      </div>
                      <div className="w-40">
                        <Input
                          id={param.id}
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData[activeTab as keyof typeof formData][param.id] || ''}
                          onChange={(e) => updateFormData(
                            activeTab as 'environmental' | 'social' | 'governance',
                            param.id,
                            e.target.value
                          )}
                          className="text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center border rounded-md">
                  <p className="text-gray-500">No parameters available for this category.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    You can add parameters in the ESG Parameter Management page.
                  </p>
                </div>
              )}
            </div>

            {activeTab === "environmental" && selectedCategory === "Energy Consumption" && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle size={16} className="text-blue-600 mr-2" />
                  <h4 className="text-sm font-semibold text-blue-800">Estimated Emissions (tCO2e)</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-500">Electricity</p>
                    <p className="font-medium">{calculatedEmissions.electricity.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-500">Coal</p>
                    <p className="font-medium">{calculatedEmissions.coal.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-500">HSD</p>
                    <p className="font-medium">{calculatedEmissions.hsd.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-500">Furnace Oil</p>
                    <p className="font-medium">{calculatedEmissions.furnaceOil.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-500">Petrol</p>
                    <p className="font-medium">{calculatedEmissions.petrol.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-500 font-bold">Total</p>
                    <p className="font-bold text-blue-700">{calculatedEmissions.total.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">These are estimated values. Actual emissions may vary based on precise emission factors.</p>
              </div>
            )}
          </Tabs>
          
          <div className="mb-6">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional context or notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 h-24"
            />
          </div>
          
          <div className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleSaveDraft}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-blue-500 hover:bg-blue-600"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Submit ESG Data
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default FormEntry;
