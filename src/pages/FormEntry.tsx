import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// UI Components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Icons
import { 
  Save, 
  Send, 
  ArrowLeft, 
  Leaf, 
  Users, 
  Briefcase 
} from "lucide-react";

// Custom Components
import CategorySection from "@/components/forms/CategorySection";

// Types
import { SiteInfo, ESGFormData, EnvironmentalData, SocialData, GovernanceData } from "@/types/esg";

// Services
import { fetchSites } from "@/services/siteService";
import { createSubmission, saveAsDraft, fetchSubmissionDetails } from "@/services/esgSubmissionService";
import { useESGParameters, isESGStructureLoaded } from "@/hooks/useESGParameters";
import { ESGParameterStructure, Parameter } from "@/services/parameterService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = [
  2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030
];

const getCurrentMonthYear = () => {
  const now = new Date();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  return { month, year };
};

const getMonthEndDate = (month: string, year: number): string => {
  const monthIndex = MONTHS.indexOf(month);
  // Get the last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

const getMonthStartDate = (month: string, year: number): string => {
  const monthIndex = MONTHS.indexOf(month);
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
};

const FormEntry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Form state
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("environmental");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Parameter values - store by parameter ID
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  // ESG data structure
  const { data: esgStructure, isLoading: isESGStructureLoading } = useESGParameters();
  const structureLoaded = isESGStructureLoaded(esgStructure);

  // Load sites - with type assertion to make TypeScript happy
  const { data: sites, isLoading: isSitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  // Load submission details if in edit mode
  const { data: submissionDetails, isLoading: isSubmissionLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => fetchSubmissionDetails(id!),
    enabled: isEditMode && !!id
  });

  // Initialize form with current month/year when component loads
  useEffect(() => {
    if (!isEditMode) {
      const { month, year } = getCurrentMonthYear();
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  }, [isEditMode]);

  // Set form data from submission if in edit mode
  useEffect(() => {
    if (isEditMode && submissionDetails && !isSubmissionLoading) {
      // Set site, period
      setSelectedSite(submissionDetails.submission.site_id);
      
      // Parse period dates
      const startDate = new Date(submissionDetails.submission.period_start);
      const startMonth = MONTHS[startDate.getMonth()];
      const startYear = startDate.getFullYear();
      
      setSelectedMonth(startMonth);
      setSelectedYear(startYear);
      
      // Set parameter values from combined data
      const allData = {
        ...submissionDetails.environmentalData,
        ...submissionDetails.socialData,
        ...submissionDetails.governanceData
      };
      
      setParameterValues(allData);
    }
  }, [isEditMode, submissionDetails, isSubmissionLoading]);

  // Set initial category when ESG structure is loaded
  useEffect(() => {
    if (structureLoaded && esgStructure) {
      const categoryType = activeTab as keyof ESGParameterStructure;
      const categories = Object.keys(esgStructure[categoryType] || {});
      
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [structureLoaded, esgStructure, activeTab, selectedCategory]);

  // Form submission handlers
  const handleSubmit = async () => {
    try {
      if (!selectedSite || !selectedMonth || !selectedYear) {
        toast({
          title: "Error",
          description: "Please select site and reporting period",
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);
      
      const startDate = getMonthStartDate(selectedMonth, selectedYear);
      const endDate = getMonthEndDate(selectedMonth, selectedYear);
      
      // Map parameter values to environmental, social, governance data
      const environmentalData: Record<string, any> = {};
      const socialData: Record<string, any> = {};
      const governanceData: Record<string, any> = {};
      
      // Process parameters by category
      if (structureLoaded && esgStructure) {
        // Environmental parameters
        Object.values(esgStructure.environmental || {}).forEach(category => {
          category.parameters.forEach(param => {
            if (parameterValues[param.id] !== undefined) {
              environmentalData[param.name.toLowerCase().replace(/\s+/g, '_')] = Number(parameterValues[param.id]) || 0;
            }
          });
        });
        
        // Social parameters
        Object.values(esgStructure.social || {}).forEach(category => {
          category.parameters.forEach(param => {
            if (parameterValues[param.id] !== undefined) {
              socialData[param.name.toLowerCase().replace(/\s+/g, '_')] = Number(parameterValues[param.id]) || 0;
            }
          });
        });
        
        // Governance parameters
        Object.values(esgStructure.governance || {}).forEach(category => {
          category.parameters.forEach(param => {
            if (parameterValues[param.id] !== undefined) {
              governanceData[param.name.toLowerCase().replace(/\s+/g, '_')] = Number(parameterValues[param.id]) || 0;
            }
          });
        });
      }
      
      console.log("Submission data:", {
        environmentalData,
        socialData,
        governanceData
      });
      
      // Submit data
      await createSubmission(
        selectedSite,
        startDate,
        endDate,
        "current-user@example.com", // Mock user email
        environmentalData,
        socialData,
        governanceData
      );
      
      toast({
        title: "Success",
        description: "ESG data submitted successfully for approval",
      });
      
      // Navigate back
      navigate("/approvals");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit ESG data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      if (!selectedSite || !selectedMonth || !selectedYear) {
        toast({
          title: "Error",
          description: "Please select site and reporting period",
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);
      
      const startDate = getMonthStartDate(selectedMonth, selectedYear);
      const endDate = getMonthEndDate(selectedMonth, selectedYear);
      
      // Map parameter values to environmental, social, governance data
      const environmentalData: Record<string, any> = {};
      const socialData: Record<string, any> = {};
      const governanceData: Record<string, any> = {};
      
      // Process parameters by category (same logic as submit)
      if (structureLoaded && esgStructure) {
        Object.values(esgStructure.environmental || {}).forEach(category => {
          category.parameters.forEach(param => {
            if (parameterValues[param.id] !== undefined) {
              environmentalData[param.name.toLowerCase().replace(/\s+/g, '_')] = Number(parameterValues[param.id]) || 0;
            }
          });
        });
        
        Object.values(esgStructure.social || {}).forEach(category => {
          category.parameters.forEach(param => {
            if (parameterValues[param.id] !== undefined) {
              socialData[param.name.toLowerCase().replace(/\s+/g, '_')] = Number(parameterValues[param.id]) || 0;
            }
          });
        });
        
        Object.values(esgStructure.governance || {}).forEach(category => {
          category.parameters.forEach(param => {
            if (parameterValues[param.id] !== undefined) {
              governanceData[param.name.toLowerCase().replace(/\s+/g, '_')] = Number(parameterValues[param.id]) || 0;
            }
          });
        });
      }
      
      await saveAsDraft(
        selectedSite,
        startDate,
        endDate,
        "current-user@example.com", // Mock user email
        environmentalData,
        socialData,
        governanceData
      );
      
      toast({
        title: "Success",
        description: "ESG data saved as draft",
      });
      
      // Stay on the same page for further editing
    } catch (error) {
      console.error("Save as draft error:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/approvals");
  };

  const handleParameterChange = (parameterId: string, value: string) => {
    setParameterValues(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };

  // Get categories for the active tab from esgStructure
  const getCurrentCategories = () => {
    if (!structureLoaded || !esgStructure) return [];
    
    const categoryType = activeTab as keyof ESGParameterStructure;
    return Object.keys(esgStructure[categoryType] || {});
  };

  // Get parameters for the selected category from esgStructure
  const getCurrentParameters = (): Parameter[] => {
    if (!structureLoaded || !esgStructure || !selectedCategory) return [];
    
    const categoryType = activeTab as keyof ESGParameterStructure;
    return esgStructure[categoryType]?.[selectedCategory]?.parameters || [];
  };

  // Loading state
  const isLoading = isSitesLoading || isESGStructureLoading || 
    (isEditMode && isSubmissionLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading ESG data form...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>
            {isEditMode ? "Edit ESG Data" : "Submit ESG Data"}
          </h1>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reporting Information</CardTitle>
          <CardDescription>
            Select the site and reporting period for this submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-3 gap-6"}`}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites && sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select 
                value={selectedYear ? selectedYear.toString() : ""} 
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="environmental" className="flex items-center">
            <Leaf className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
            <span className={isMobile ? "text-xs" : ""}>Environmental</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center">
            <Users className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
            <span className={isMobile ? "text-xs" : ""}>Social</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center">
            <Briefcase className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
            <span className={isMobile ? "text-xs" : ""}>Governance</span>
          </TabsTrigger>
        </TabsList>

        {["environmental", "social", "governance"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar for selecting categories */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className={isMobile ? "text-base" : "text-lg"}>Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="space-y-1">
                        {getCurrentCategories().map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Main content for parameters */}
              <div className="md:col-span-3">
                <ScrollArea className="h-[65vh]">
                  {selectedCategory && (
                    <CategorySection
                      categoryName={selectedCategory}
                      parameters={getCurrentParameters()}
                      values={parameterValues}
                      onChange={handleParameterChange}
                      disabled={isSubmitting}
                    />
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end space-x-4 mb-8">
        <Button
          variant="outline"
          onClick={handleSaveAsDraft}
          disabled={isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Send className="mr-2 h-4 w-4" />
          Submit for Approval
        </Button>
      </div>
    </div>
  );
};

export default FormEntry;
