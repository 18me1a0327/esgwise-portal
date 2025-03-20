
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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
  Loader2
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = ["2022", "2023", "2024", "2025", "2026"];

const REPORTING_SPANS = ["Monthly", "Quarterly", "Annually"];

// Environmental categories
const ENV_CATEGORIES = {
  "Energy Consumption": [
    { id: "total_electricity", label: "Total electricity consumption", unit: "kWh" },
    { id: "renewable_ppa", label: "Electricity from renewable sources", unit: "kWh" },
    { id: "renewable_rooftop", label: "Electricity from renewable sources through Rooftop", unit: "kWh" },
    { id: "coal_consumption", label: "Coal consumption", unit: "MT" },
    { id: "hsd_consumption", label: "HSD (High-Speed Diesel) consumption", unit: "KL" },
    { id: "furnace_oil_consumption", label: "Furnace Oil consumption", unit: "MT" },
    { id: "petrol_consumption", label: "Petrol consumption", unit: "KL" }
  ],
  "Air Emissions": [
    { id: "nox", label: "Oxides of Nitrogen (NOx)", unit: "MT" },
    { id: "sox", label: "Sulfur Oxides (SOx)", unit: "MT" },
    { id: "pm", label: "Particulate Matter (PM)", unit: "MT" },
    { id: "pop", label: "Persistent Organic Pollutants", unit: "MT" },
    { id: "voc", label: "Volatile Organic Compounds", unit: "MT" },
    { id: "hap", label: "Hazardous Air Pollutants", unit: "MT" }
  ],
  "Water Management": [
    { id: "water_withdrawal", label: "Total Water Withdrawal", unit: "KL" },
    { id: "third_party_water", label: "Third-Party Water Usage", unit: "KL" },
    { id: "rainwater", label: "Rainwater Harvesting", unit: "KL" },
    { id: "wastewater_generated", label: "Total Wastewater Generated", unit: "KL" },
    { id: "recycled_wastewater", label: "Recycled Wastewater", unit: "KL" },
    { id: "water_discharged", label: "Water Discharged to Third Parties", unit: "KL" }
  ],
  "Waste Management": [
    { id: "hazardous_landfill", label: "Hazardous Waste to Landfill", unit: "MT" },
    { id: "hazardous_incinerated", label: "Hazardous Waste Incinerated", unit: "MT" },
    { id: "hazardous_coprocessed", label: "Hazardous Waste Co-Processed", unit: "MT" },
    { id: "total_hazardous", label: "Total Hazardous Waste", unit: "MT" },
    { id: "plastic_waste", label: "Plastic Waste", unit: "MT" },
    { id: "non_hazardous", label: "Non-Hazardous Waste", unit: "MT" },
    { id: "bio_medical", label: "Bio-Medical Waste", unit: "MT" },
    { id: "e_waste", label: "E-Waste", unit: "MT" },
    { id: "waste_oil", label: "Waste Oil", unit: "MT" },
    { id: "total_waste", label: "Total Waste Generated", unit: "MT" }
  ]
};

// Social categories
const SOCIAL_CATEGORIES = {
  "Employment & Workforce": [
    { id: "total_employees", label: "Total Number of Employees", unit: "" },
    { id: "male_employees", label: "Number of Male Employees", unit: "" },
    { id: "female_employees", label: "Number of Female Employees", unit: "" },
    { id: "new_hires", label: "Number of New Hires", unit: "" },
    { id: "contract_male", label: "Number of Contract Workers (Male)", unit: "" },
    { id: "contract_female", label: "Number of Contract Workers (Female)", unit: "" },
    { id: "attrition", label: "Attrition (Absolute Number)", unit: "" }
  ],
  "Employee Benefits": [
    { id: "health_insurance", label: "Employees with Health Insurance", unit: "%" },
    { id: "accident_insurance", label: "Employees with Accident Insurance", unit: "%" },
    { id: "parental_benefits", label: "Employees with Parental Benefits", unit: "%" },
    { id: "pf_coverage", label: "Employees with PF Coverage", unit: "%" },
    { id: "gratuity_coverage", label: "Employees with Gratuity Coverage", unit: "%" },
    { id: "esi_coverage", label: "Employees with ESI Coverage", unit: "%" }
  ]
};

// Governance categories
const GOVERNANCE_CATEGORIES = {
  "Board Composition": [
    { id: "board_members", label: "Number of Board Members", unit: "" },
    { id: "women_percentage", label: "Percentage of Women on Board", unit: "%" },
    { id: "board_under30", label: "Board Members Under 30 Years", unit: "%" },
    { id: "board_30to50", label: "Board Members Between 30-50 Years", unit: "%" },
    { id: "board_above50", label: "Board Members Above 50 Years", unit: "%" }
  ],
  "Cybersecurity": [
    { id: "cybersecurity_incidents", label: "Number of Data Privacy or Cybersecurity Incidents", unit: "" }
  ],
  "Business Ethics": [
    { id: "corruption_incidents", label: "Number of Corruption and Bribery Incidents", unit: "" },
    { id: "legal_fines", label: "Number of Legal Fines or Penalties", unit: "" }
  ]
};

const FormEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [reportingSpan, setReportingSpan] = useState<string>("Monthly");
  const [submitterName, setSubmitterName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState("environmental");
  const [selectedCategory, setSelectedCategory] = useState<string>("Energy Consumption");
  const [formData, setFormData] = useState({
    environmental: {} as Record<string, number>,
    social: {} as Record<string, number>,
    governance: {} as Record<string, number>
  });

  // Fetch sites data
  const { data: sites, isLoading: isSitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  // Fetch submission details if in edit mode
  const { data: submissionDetails, isLoading: isSubmissionLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => fetchSubmissionDetails(id as string),
    enabled: isEditMode
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (isDraft: boolean) => {
      // Calculate period start and end dates based on month/year selection
      let periodStart, periodEnd;
      
      const year = parseInt(selectedYear);
      const monthIndex = MONTHS.indexOf(selectedMonth);
      
      if (reportingSpan === "Monthly" && monthIndex !== -1) {
        // For monthly reporting
        periodStart = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-01`;
        
        // Calculate the last day of the month
        const lastDay = new Date(year, monthIndex + 1, 0).getDate();
        periodEnd = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${lastDay}`;
      } else if (reportingSpan === "Quarterly") {
        // For quarterly reporting
        const quarter = Math.floor(monthIndex / 3);
        const startMonth = quarter * 3 + 1;
        const endMonth = startMonth + 2;
        
        periodStart = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
        
        // Last day of the last month in the quarter
        const lastDay = new Date(year, endMonth, 0).getDate();
        periodEnd = `${year}-${endMonth.toString().padStart(2, '0')}-${lastDay}`;
      } else {
        // Default to annual reporting (full year)
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
      if (variables) {
        toast.success(variables ? "Draft saved successfully!" : "ESG data submitted for approval successfully!");
        if (!variables) {
          navigate("/approvals");
        }
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  });

  // Populate form with existing data if in edit mode
  useEffect(() => {
    if (isEditMode && submissionDetails) {
      const { submission, environmentalData, socialData, governanceData } = submissionDetails;
      
      setSelectedSite(submission.site_id);
      
      // Parse dates to set month and year
      const startDate = new Date(submission.period_start);
      setSelectedMonth(MONTHS[startDate.getMonth()]);
      setSelectedYear(startDate.getFullYear().toString());
      
      // Determine reporting span based on date range
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
      
      // Set form data
      setFormData({
        environmental: { ...(environmentalData || {}) },
        social: { ...(socialData || {}) },
        governance: { ...(governanceData || {}) }
      });
    }
  }, [isEditMode, submissionDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedSite) {
      toast.error("Please select a site location");
      return;
    }
    
    if (!selectedMonth && reportingSpan === "Monthly") {
      toast.error("Please select a month");
      return;
    }
    
    if (!selectedYear) {
      toast.error("Please select a year");
      return;
    }
    
    if (!submitterName) {
      toast.error("Please enter your name");
      return;
    }
    
    // Submit the form
    submitMutation.mutate(false);
  };

  const handleSaveDraft = () => {
    // Same validation as submit
    if (!selectedSite) {
      toast.error("Please select a site location");
      return;
    }
    
    if (!selectedYear) {
      toast.error("Please select a year");
      return;
    }
    
    // Save as draft
    submitMutation.mutate(true);
  };

  // Update form data with debouncing to avoid flickering
  const updateFormData = (category: 'environmental' | 'social' | 'governance', id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: value === '' ? null : Number(value)
      }
    }));
  };

  // Get parameters for the current tab and category
  const getCurrentParameters = () => {
    if (activeTab === "environmental") {
      return ENV_CATEGORIES[selectedCategory as keyof typeof ENV_CATEGORIES] || [];
    } else if (activeTab === "social") {
      return SOCIAL_CATEGORIES[selectedCategory as keyof typeof SOCIAL_CATEGORIES] || [];
    } else {
      return GOVERNANCE_CATEGORIES[selectedCategory as keyof typeof GOVERNANCE_CATEGORIES] || [];
    }
  };

  // Get all categories for the current tab
  const getCurrentCategories = () => {
    if (activeTab === "environmental") {
      return Object.keys(ENV_CATEGORIES);
    } else if (activeTab === "social") {
      return Object.keys(SOCIAL_CATEGORIES);
    } else {
      return Object.keys(GOVERNANCE_CATEGORIES);
    }
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
                    {sites?.map(site => (
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
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger id="subcategory" className="mt-1">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {getCurrentCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Parameters</h3>
              
              <div className="space-y-4">
                {getCurrentParameters().map(param => (
                  <div key={param.id} className="flex items-center border-b border-gray-100 pb-3">
                    <div className="mr-2">
                      <PlusCircle size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={param.id} className="font-medium">
                        {param.label}
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {param.unit}
                        </span>
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
            </div>
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
