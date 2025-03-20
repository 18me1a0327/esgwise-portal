
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Info,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchSites } from "@/services/siteService";
import { createSubmission, saveAsDraft } from "@/services/esgSubmissionService";

const FormEntry = () => {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [submitterName, setSubmitterName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("environmental");
  const [formData, setFormData] = useState({
    environmental: {} as Record<string, number>,
    social: {} as Record<string, number>,
    governance: {} as Record<string, number>
  });
  const [expandedSections, setExpandedSections] = useState({
    energyConsumption: true,
    airEmissions: false,
    waterManagement: false,
    wasteManagement: false,
    employment: true,
    employeeBenefits: false,
    wagesCompensation: false,
    trainingDevelopment: false,
    workplaceSafety: false,
    complaintsGrievances: false,
    boardComposition: true,
    cybersecurity: false,
    businessEthics: false
  });

  // Fetch sites data
  const { data: sites, isLoading: isSitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (isDraft: boolean) => {
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

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedSite) {
      toast.error("Please select a site");
      return;
    }
    
    if (!periodStart || !periodEnd) {
      toast.error("Please select reporting period start and end dates");
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
    // Validation
    if (!selectedSite) {
      toast.error("Please select a site");
      return;
    }
    
    if (!periodStart || !periodEnd) {
      toast.error("Please select reporting period start and end dates");
      return;
    }
    
    if (!submitterName) {
      toast.error("Please enter your name");
      return;
    }
    
    // Save as draft
    submitMutation.mutate(true);
  };

  const handleInputChange = (category: 'environmental' | 'social' | 'governance', id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: value === '' ? null : Number(value)
      }
    }));
  };

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const Section = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string; 
    sectionKey: string; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections[sectionKey as keyof typeof expandedSections];
    
    return (
      <div className="mb-6">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 text-left hover:bg-gray-100 focus:outline-none"
          onClick={() => toggleSection(sectionKey)}
        >
          <span className="font-medium">{title}</span>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border border-gray-100 rounded-lg p-4 mt-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const FormField = ({ 
    label, 
    id, 
    unit, 
    info,
    category
  }: { 
    label: string; 
    id: string; 
    unit: string;
    info?: string;
    category: 'environmental' | 'social' | 'governance';
  }) => (
    <div className="mb-4">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {info && (
          <div className="relative group">
            <Info size={14} className="text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {info}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </Label>
      <div className="relative">
        <Input 
          id={id} 
          className="pr-12" 
          type="number" 
          min="0" 
          step="0.01" 
          value={formData[category][id] || ''} 
          onChange={(e) => handleInputChange(category, id, e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {unit}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ESG Data Collection Form</h1>
          <p className="text-gray-500">Submit structured ESG data for review and approval</p>
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
          <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="site">Site/Location</Label>
              {isSitesLoading ? (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Loading sites...
                </div>
              ) : (
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger id="site">
                    <SelectValue placeholder="Select site" />
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
              <Label htmlFor="period-start">Reporting Period - Start</Label>
              <Input 
                id="period-start" 
                type="date" 
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="period-end">Reporting Period - End</Label>
              <Input 
                id="period-end" 
                type="date" 
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>

            <div className="md:col-span-4">
              <Label htmlFor="submitter">Submitted By</Label>
              <Input 
                id="submitter" 
                placeholder="Your name" 
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full md:w-auto grid grid-cols-3">
              <TabsTrigger value="environmental" className="flex items-center gap-2">
                <Leaf size={16} />
                <span className="hidden sm:inline">Environmental</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Users size={16} />
                <span className="hidden sm:inline">Social</span>
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center gap-2">
                <Briefcase size={16} />
                <span className="hidden sm:inline">Governance</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="environmental" className="mt-6">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
              >
                <Section title="Energy Consumption" sectionKey="energyConsumption">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Total Electricity Consumption" 
                      id="total_electricity" 
                      unit="kWh" 
                      info="Total electricity consumed from all sources"
                      category="environmental"
                    />
                    <FormField 
                      label="Renewable Electricity (PPA)" 
                      id="renewable_ppa" 
                      unit="kWh"
                      info="Electricity from renewable sources through Power Purchase Agreements"
                      category="environmental"
                    />
                    <FormField 
                      label="Renewable Electricity (Rooftop)" 
                      id="renewable_rooftop" 
                      unit="kWh"
                      info="Electricity generated from rooftop solar installations"
                      category="environmental"
                    />
                    <FormField 
                      label="Coal Consumption" 
                      id="coal_consumption" 
                      unit="MT"
                      info="Metric tons of coal consumed"
                      category="environmental"
                    />
                    <FormField 
                      label="HSD Consumption" 
                      id="hsd_consumption" 
                      unit="KL"
                      info="High-Speed Diesel consumption in kiloliters"
                      category="environmental"
                    />
                    <FormField 
                      label="Furnace Oil Consumption" 
                      id="furnace_oil_consumption" 
                      unit="MT"
                      info="Metric tons of furnace oil consumed"
                      category="environmental"
                    />
                    <FormField 
                      label="Petrol Consumption" 
                      id="petrol_consumption" 
                      unit="KL"
                      info="Petrol consumption in kiloliters"
                      category="environmental"
                    />
                  </div>
                </Section>
                
                <Section title="Air Emissions" sectionKey="airEmissions">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Oxides of Nitrogen (NOx)" 
                      id="nox" 
                      unit="MT"
                      info="Metric tons of NOx emissions"
                      category="environmental"
                    />
                    <FormField 
                      label="Sulfur Oxides (SOx)" 
                      id="sox" 
                      unit="MT"
                      info="Metric tons of SOx emissions"
                      category="environmental"
                    />
                    <FormField 
                      label="Particulate Matter (PM)" 
                      id="pm" 
                      unit="MT"
                      info="Metric tons of particulate matter emissions"
                      category="environmental"
                    />
                    <FormField 
                      label="Persistent Organic Pollutants" 
                      id="pop" 
                      unit="MT"
                      info="Metric tons of persistent organic pollutants"
                      category="environmental"
                    />
                    <FormField 
                      label="Volatile Organic Compounds" 
                      id="voc" 
                      unit="MT"
                      info="Metric tons of volatile organic compounds"
                      category="environmental"
                    />
                    <FormField 
                      label="Hazardous Air Pollutants" 
                      id="hap" 
                      unit="MT"
                      info="Metric tons of hazardous air pollutants"
                      category="environmental"
                    />
                  </div>
                </Section>
                
                <Section title="Water & Wastewater Management" sectionKey="waterManagement">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Total Water Withdrawal" 
                      id="water_withdrawal" 
                      unit="KL"
                      info="Total water withdrawn in kiloliters"
                      category="environmental"
                    />
                    <FormField 
                      label="Third-Party Water Usage" 
                      id="third_party_water" 
                      unit="KL"
                      info="Water obtained from third-party sources in kiloliters"
                      category="environmental"
                    />
                    <FormField 
                      label="Rainwater Harvesting" 
                      id="rainwater" 
                      unit="KL"
                      info="Water collected from rainwater harvesting in kiloliters"
                      category="environmental"
                    />
                    <FormField 
                      label="Total Wastewater Generated" 
                      id="wastewater_generated" 
                      unit="KL"
                      info="Total wastewater generated (LTDS+HTDS) in kiloliters"
                      category="environmental"
                    />
                    <FormField 
                      label="Recycled Wastewater" 
                      id="recycled_wastewater" 
                      unit="KL"
                      info="Wastewater recycled and reused in kiloliters"
                      category="environmental"
                    />
                    <FormField 
                      label="Water Discharged to Third Parties" 
                      id="water_discharged" 
                      unit="KL"
                      info="Water discharged to third parties in kiloliters"
                      category="environmental"
                    />
                  </div>
                </Section>
                
                <Section title="Waste Management" sectionKey="wasteManagement">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Hazardous Waste to Landfill" 
                      id="hazardous_landfill" 
                      unit="MT"
                      info="Hazardous waste disposed to landfill in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Hazardous Waste Incinerated" 
                      id="hazardous_incinerated" 
                      unit="MT"
                      info="Hazardous waste incinerated in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Hazardous Waste Co-Processed" 
                      id="hazardous_coprocessed" 
                      unit="MT"
                      info="Hazardous waste co-processed in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Total Hazardous Waste" 
                      id="total_hazardous" 
                      unit="MT"
                      info="Total hazardous waste in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Plastic Waste" 
                      id="plastic_waste" 
                      unit="MT"
                      info="Plastic waste in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Non-Hazardous Waste" 
                      id="non_hazardous" 
                      unit="MT"
                      info="Non-hazardous waste in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Bio-Medical Waste" 
                      id="bio_medical" 
                      unit="MT"
                      info="Bio-medical waste in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="E-Waste" 
                      id="e_waste" 
                      unit="MT"
                      info="Electronic waste in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Waste Oil" 
                      id="waste_oil" 
                      unit="MT"
                      info="Waste oil in metric tons"
                      category="environmental"
                    />
                    <FormField 
                      label="Total Waste Generated" 
                      id="total_waste" 
                      unit="MT"
                      info="Total waste generated in metric tons"
                      category="environmental"
                    />
                  </div>
                </Section>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="social" className="mt-6">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
              >
                <Section title="Employment & Workforce" sectionKey="employment">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Total Number of Employees" 
                      id="total_employees" 
                      unit=""
                      info="Total number of permanent employees"
                      category="social"
                    />
                    <FormField 
                      label="Number of Male Employees" 
                      id="male_employees" 
                      unit=""
                      info="Number of male permanent employees"
                      category="social"
                    />
                    <FormField 
                      label="Number of Female Employees" 
                      id="female_employees" 
                      unit=""
                      info="Number of female permanent employees"
                      category="social"
                    />
                    <FormField 
                      label="Number of New Hires" 
                      id="new_hires" 
                      unit=""
                      info="Number of new employees hired during the reporting period"
                      category="social"
                    />
                    <FormField 
                      label="Number of Contract Workers (Male)" 
                      id="contract_male" 
                      unit=""
                      info="Number of male contract workers"
                      category="social"
                    />
                    <FormField 
                      label="Number of Contract Workers (Female)" 
                      id="contract_female" 
                      unit=""
                      info="Number of female contract workers"
                      category="social"
                    />
                    <FormField 
                      label="Attrition (Absolute Number)" 
                      id="attrition" 
                      unit=""
                      info="Number of employees who left during the reporting period"
                      category="social"
                    />
                  </div>
                </Section>
                
                <Section title="Employee Benefits" sectionKey="employeeBenefits">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Employees with Health Insurance" 
                      id="health_insurance" 
                      unit="%"
                      info="Percentage of employees covered by health insurance"
                      category="social"
                    />
                    <FormField 
                      label="Employees with Accident Insurance" 
                      id="accident_insurance" 
                      unit="%"
                      info="Percentage of employees covered by accident insurance"
                      category="social"
                    />
                    <FormField 
                      label="Employees with Parental Benefits" 
                      id="parental_benefits" 
                      unit="%"
                      info="Percentage of employees covered by maternity & paternity benefits"
                      category="social"
                    />
                    <FormField 
                      label="Employees with PF Coverage" 
                      id="pf_coverage" 
                      unit="%"
                      info="Percentage of employees covered by Provident Fund"
                      category="social"
                    />
                    <FormField 
                      label="Employees with Gratuity Coverage" 
                      id="gratuity_coverage" 
                      unit="%"
                      info="Percentage of employees covered by gratuity"
                      category="social"
                    />
                    <FormField 
                      label="Employees with ESI Coverage" 
                      id="esi_coverage" 
                      unit="%"
                      info="Percentage of employees covered by Employee State Insurance"
                      category="social"
                    />
                  </div>
                </Section>
                
                <Section title="Wages & Compensation" sectionKey="wagesCompensation">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Median Salary (Male Employees)" 
                      id="median_male_salary" 
                      unit="INR/year"
                      info="Median annual salary for male employees"
                      category="social"
                    />
                    <FormField 
                      label="Median Salary (Female Employees)" 
                      id="median_female_salary" 
                      unit="INR/year"
                      info="Median annual salary for female employees"
                      category="social"
                    />
                    <FormField 
                      label="Female Wages as % of Total Wages" 
                      id="female_wages_percentage" 
                      unit="%"
                      info="Gross wages paid to females as a percentage of total wages paid"
                      category="social"
                    />
                  </div>
                </Section>
                
                <Section title="Training & Development" sectionKey="trainingDevelopment">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Performance & Career Development Reviews" 
                      id="performance_reviews" 
                      unit="%"
                      info="Percentage of employees receiving regular performance and career development reviews"
                      category="social"
                    />
                    <FormField 
                      label="Training Hours - GMP" 
                      id="gmp_training" 
                      unit="Man-Hours"
                      info="Total training hours for Good Manufacturing Practices"
                      category="social"
                    />
                    <FormField 
                      label="Training Hours - EHS" 
                      id="ehs_training" 
                      unit="Man-Hours"
                      info="Total training hours for Environment, Health & Safety"
                      category="social"
                    />
                    <FormField 
                      label="Other Training Hours" 
                      id="other_training" 
                      unit="Man-Hours"
                      info="Total training hours for external technical & behavioral training"
                      category="social"
                    />
                  </div>
                </Section>
                
                <Section title="Workplace Safety" sectionKey="workplaceSafety">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Reportable Incidents (Employees)" 
                      id="reportable_employees" 
                      unit=""
                      info="Number of reportable incidents involving employees"
                      category="social"
                    />
                    <FormField 
                      label="Reportable Incidents (Workers)" 
                      id="reportable_workers" 
                      unit=""
                      info="Number of reportable incidents involving contract workers"
                      category="social"
                    />
                    <FormField 
                      label="Recordable Work-Related Injuries (Employees)" 
                      id="injuries_employees" 
                      unit=""
                      info="Total recordable work-related injuries for employees"
                      category="social"
                    />
                    <FormField 
                      label="Recordable Work-Related Injuries (Workers)" 
                      id="injuries_workers" 
                      unit=""
                      info="Total recordable work-related injuries for contract workers"
                      category="social"
                    />
                    <FormField 
                      label="Fatalities (Employees)" 
                      id="fatalities_employees" 
                      unit=""
                      info="Number of work-related fatalities for employees"
                      category="social"
                    />
                    <FormField 
                      label="Fatalities (Workers)" 
                      id="fatalities_workers" 
                      unit=""
                      info="Number of work-related fatalities for contract workers"
                      category="social"
                    />
                    <FormField 
                      label="Man-Hours Worked (Employees)" 
                      id="manhours_employees" 
                      unit="Man-Hours"
                      info="Total man-hours worked by employees"
                      category="social"
                    />
                    <FormField 
                      label="Man-Hours Worked (Workers)" 
                      id="manhours_workers" 
                      unit="Man-Hours"
                      info="Total man-hours worked by contract workers"
                      category="social"
                    />
                  </div>
                </Section>
                
                <Section title="Complaints & Grievances" sectionKey="complaintsGrievances">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Number of Workplace Complaints" 
                      id="workplace_complaints" 
                      unit=""
                      info="Complaints related to health & safety, working conditions, discrimination, harassment, wages, etc."
                      category="social"
                    />
                    <FormField 
                      label="Number of Consumer Complaints" 
                      id="consumer_complaints" 
                      unit=""
                      info="Complaints related to data privacy, cybersecurity, product safety, etc."
                      category="social"
                    />
                  </div>
                </Section>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="governance" className="mt-6">
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
              >
                <Section title="Board Composition & Diversity" sectionKey="boardComposition">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Number of Board Members" 
                      id="board_members" 
                      unit=""
                      info="Total number of board members"
                      category="governance"
                    />
                    <FormField 
                      label="Percentage of Women on Board" 
                      id="women_percentage" 
                      unit="%"
                      info="Percentage of board members who are women"
                      category="governance"
                    />
                    
                    <div className="col-span-full">
                      <p className="font-medium mb-3">Board Members by Age Group (%)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField 
                          label="Under 30 Years" 
                          id="board_under30" 
                          unit="%"
                          info="Percentage of board members under 30 years old"
                          category="governance"
                        />
                        <FormField 
                          label="Between 30 and 50 Years" 
                          id="board_30to50" 
                          unit="%"
                          info="Percentage of board members between 30 and 50 years old"
                          category="governance"
                        />
                        <FormField 
                          label="Above 50 Years" 
                          id="board_above50" 
                          unit="%"
                          info="Percentage of board members above 50 years old"
                          category="governance"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-full">
                      <p className="font-medium mb-3">Board Members by Experience Level (%)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField 
                          label="Under 5 Years Experience" 
                          id="exp_under5" 
                          unit="%"
                          info="Percentage of board members with less than 5 years of experience"
                          category="governance"
                        />
                        <FormField 
                          label="Between 5 and 10 Years" 
                          id="exp_5to10" 
                          unit="%"
                          info="Percentage of board members with 5-10 years of experience"
                          category="governance"
                        />
                        <FormField 
                          label="Above 10 Years Experience" 
                          id="exp_above10" 
                          unit="%"
                          info="Percentage of board members with more than 10 years of experience"
                          category="governance"
                        />
                      </div>
                    </div>
                  </div>
                </Section>
                
                <Section title="Cybersecurity & Data Privacy" sectionKey="cybersecurity">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Number of Data Privacy or Cybersecurity Incidents" 
                      id="cybersecurity_incidents" 
                      unit=""
                      info="Total number of data privacy or cybersecurity incidents during the reporting period"
                      category="governance"
                    />
                  </div>
                </Section>
                
                <Section title="Business Ethics & Compliance" sectionKey="businessEthics">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Number of Corruption and Bribery Incidents" 
                      id="corruption_incidents" 
                      unit=""
                      info="Total number of corruption and bribery incidents during the reporting period"
                      category="governance"
                    />
                    <FormField 
                      label="Number of Legal Fines or Penalties" 
                      id="legal_fines" 
                      unit=""
                      info="Total number of legal fines or penalties during the reporting period"
                      category="governance"
                    />
                  </div>
                </Section>
              </motion.div>
            </TabsContent>
          </Tabs>
          
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
              className="gap-2 bg-esg-blue hover:bg-esg-blue/90"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Submit for Approval
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default FormEntry;
