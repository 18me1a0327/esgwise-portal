
import React, { useState } from "react";
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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockSites } from "@/types/esg";

const FormEntry = () => {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [activeTab, setActiveTab] = useState("environmental");
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

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ESG data submitted for approval successfully!");
    navigate("/approvals");
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully!");
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
    info 
  }: { 
    label: string; 
    id: string; 
    unit: string;
    info?: string;
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
        <Input id={id} className="pr-12" type="number" min="0" step="0.01" />
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
          <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-3">
            <div>
              <Label htmlFor="site">Site/Location</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {mockSites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="period-start">Reporting Period - Start</Label>
              <Input id="period-start" type="date" />
            </div>
            
            <div>
              <Label htmlFor="period-end">Reporting Period - End</Label>
              <Input id="period-end" type="date" />
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
                      id="total-electricity" 
                      unit="kWh" 
                      info="Total electricity consumed from all sources"
                    />
                    <FormField 
                      label="Renewable Electricity (PPA)" 
                      id="renewable-ppa" 
                      unit="kWh"
                      info="Electricity from renewable sources through Power Purchase Agreements"
                    />
                    <FormField 
                      label="Renewable Electricity (Rooftop)" 
                      id="renewable-rooftop" 
                      unit="kWh"
                      info="Electricity generated from rooftop solar installations"
                    />
                    <FormField 
                      label="Coal Consumption" 
                      id="coal" 
                      unit="MT"
                      info="Metric tons of coal consumed"
                    />
                    <FormField 
                      label="HSD Consumption" 
                      id="hsd" 
                      unit="KL"
                      info="High-Speed Diesel consumption in kiloliters"
                    />
                    <FormField 
                      label="Furnace Oil Consumption" 
                      id="furnace-oil" 
                      unit="MT"
                      info="Metric tons of furnace oil consumed"
                    />
                    <FormField 
                      label="Petrol Consumption" 
                      id="petrol" 
                      unit="KL"
                      info="Petrol consumption in kiloliters"
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
                    />
                    <FormField 
                      label="Sulfur Oxides (SOx)" 
                      id="sox" 
                      unit="MT"
                      info="Metric tons of SOx emissions"
                    />
                    <FormField 
                      label="Particulate Matter (PM)" 
                      id="pm" 
                      unit="MT"
                      info="Metric tons of particulate matter emissions"
                    />
                    <FormField 
                      label="Persistent Organic Pollutants" 
                      id="pop" 
                      unit="MT"
                      info="Metric tons of persistent organic pollutants"
                    />
                    <FormField 
                      label="Volatile Organic Compounds" 
                      id="voc" 
                      unit="MT"
                      info="Metric tons of volatile organic compounds"
                    />
                    <FormField 
                      label="Hazardous Air Pollutants" 
                      id="hap" 
                      unit="MT"
                      info="Metric tons of hazardous air pollutants"
                    />
                  </div>
                </Section>
                
                <Section title="Water & Wastewater Management" sectionKey="waterManagement">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Total Water Withdrawal" 
                      id="water-withdrawal" 
                      unit="KL"
                      info="Total water withdrawn in kiloliters"
                    />
                    <FormField 
                      label="Third-Party Water Usage" 
                      id="third-party-water" 
                      unit="KL"
                      info="Water obtained from third-party sources in kiloliters"
                    />
                    <FormField 
                      label="Rainwater Harvesting" 
                      id="rainwater" 
                      unit="KL"
                      info="Water collected from rainwater harvesting in kiloliters"
                    />
                    <FormField 
                      label="Total Wastewater Generated" 
                      id="wastewater-generated" 
                      unit="KL"
                      info="Total wastewater generated (LTDS+HTDS) in kiloliters"
                    />
                    <FormField 
                      label="Recycled Wastewater" 
                      id="recycled-wastewater" 
                      unit="KL"
                      info="Wastewater recycled and reused in kiloliters"
                    />
                    <FormField 
                      label="Water Discharged to Third Parties" 
                      id="water-discharged" 
                      unit="KL"
                      info="Water discharged to third parties in kiloliters"
                    />
                  </div>
                </Section>
                
                <Section title="Waste Management" sectionKey="wasteManagement">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Hazardous Waste to Landfill" 
                      id="hazardous-landfill" 
                      unit="MT"
                      info="Hazardous waste disposed to landfill in metric tons"
                    />
                    <FormField 
                      label="Hazardous Waste Incinerated" 
                      id="hazardous-incinerated" 
                      unit="MT"
                      info="Hazardous waste incinerated in metric tons"
                    />
                    <FormField 
                      label="Hazardous Waste Co-Processed" 
                      id="hazardous-coprocessed" 
                      unit="MT"
                      info="Hazardous waste co-processed in metric tons"
                    />
                    <FormField 
                      label="Total Hazardous Waste" 
                      id="total-hazardous" 
                      unit="MT"
                      info="Total hazardous waste in metric tons"
                    />
                    <FormField 
                      label="Plastic Waste" 
                      id="plastic-waste" 
                      unit="MT"
                      info="Plastic waste in metric tons"
                    />
                    <FormField 
                      label="Non-Hazardous Waste" 
                      id="non-hazardous" 
                      unit="MT"
                      info="Non-hazardous waste in metric tons"
                    />
                    <FormField 
                      label="Bio-Medical Waste" 
                      id="bio-medical" 
                      unit="MT"
                      info="Bio-medical waste in metric tons"
                    />
                    <FormField 
                      label="E-Waste" 
                      id="e-waste" 
                      unit="MT"
                      info="Electronic waste in metric tons"
                    />
                    <FormField 
                      label="Waste Oil" 
                      id="waste-oil" 
                      unit="MT"
                      info="Waste oil in metric tons"
                    />
                    <FormField 
                      label="Total Waste Generated" 
                      id="total-waste" 
                      unit="MT"
                      info="Total waste generated in metric tons"
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
                      id="total-employees" 
                      unit=""
                      info="Total number of permanent employees"
                    />
                    <FormField 
                      label="Number of Male Employees" 
                      id="male-employees" 
                      unit=""
                      info="Number of male permanent employees"
                    />
                    <FormField 
                      label="Number of Female Employees" 
                      id="female-employees" 
                      unit=""
                      info="Number of female permanent employees"
                    />
                    <FormField 
                      label="Number of New Hires" 
                      id="new-hires" 
                      unit=""
                      info="Number of new employees hired during the reporting period"
                    />
                    <FormField 
                      label="Number of Contract Workers (Male)" 
                      id="contract-male" 
                      unit=""
                      info="Number of male contract workers"
                    />
                    <FormField 
                      label="Number of Contract Workers (Female)" 
                      id="contract-female" 
                      unit=""
                      info="Number of female contract workers"
                    />
                    <FormField 
                      label="Attrition (Absolute Number)" 
                      id="attrition" 
                      unit=""
                      info="Number of employees who left during the reporting period"
                    />
                  </div>
                </Section>
                
                <Section title="Employee Benefits" sectionKey="employeeBenefits">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Employees with Health Insurance" 
                      id="health-insurance" 
                      unit="%"
                      info="Percentage of employees covered by health insurance"
                    />
                    <FormField 
                      label="Employees with Accident Insurance" 
                      id="accident-insurance" 
                      unit="%"
                      info="Percentage of employees covered by accident insurance"
                    />
                    <FormField 
                      label="Employees with Parental Benefits" 
                      id="parental-benefits" 
                      unit="%"
                      info="Percentage of employees covered by maternity & paternity benefits"
                    />
                    <FormField 
                      label="Employees with PF Coverage" 
                      id="pf-coverage" 
                      unit="%"
                      info="Percentage of employees covered by Provident Fund"
                    />
                    <FormField 
                      label="Employees with Gratuity Coverage" 
                      id="gratuity-coverage" 
                      unit="%"
                      info="Percentage of employees covered by gratuity"
                    />
                    <FormField 
                      label="Employees with ESI Coverage" 
                      id="esi-coverage" 
                      unit="%"
                      info="Percentage of employees covered by Employee State Insurance"
                    />
                  </div>
                </Section>
                
                <Section title="Wages & Compensation" sectionKey="wagesCompensation">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Median Salary (Male Employees)" 
                      id="median-male-salary" 
                      unit="INR/year"
                      info="Median annual salary for male employees"
                    />
                    <FormField 
                      label="Median Salary (Female Employees)" 
                      id="median-female-salary" 
                      unit="INR/year"
                      info="Median annual salary for female employees"
                    />
                    <FormField 
                      label="Female Wages as % of Total Wages" 
                      id="female-wages-percentage" 
                      unit="%"
                      info="Gross wages paid to females as a percentage of total wages paid"
                    />
                  </div>
                </Section>
                
                <Section title="Training & Development" sectionKey="trainingDevelopment">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Performance & Career Development Reviews" 
                      id="performance-reviews" 
                      unit="%"
                      info="Percentage of employees receiving regular performance and career development reviews"
                    />
                    <FormField 
                      label="Training Hours - GMP" 
                      id="gmp-training" 
                      unit="Man-Hours"
                      info="Total training hours for Good Manufacturing Practices"
                    />
                    <FormField 
                      label="Training Hours - EHS" 
                      id="ehs-training" 
                      unit="Man-Hours"
                      info="Total training hours for Environment, Health & Safety"
                    />
                    <FormField 
                      label="Other Training Hours" 
                      id="other-training" 
                      unit="Man-Hours"
                      info="Total training hours for external technical & behavioral training"
                    />
                  </div>
                </Section>
                
                <Section title="Workplace Safety" sectionKey="workplaceSafety">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <FormField 
                      label="Reportable Incidents (Employees)" 
                      id="reportable-employees" 
                      unit=""
                      info="Number of reportable incidents involving employees"
                    />
                    <FormField 
                      label="Reportable Incidents (Workers)" 
                      id="reportable-workers" 
                      unit=""
                      info="Number of reportable incidents involving contract workers"
                    />
                    <FormField 
                      label="Recordable Work-Related Injuries (Employees)" 
                      id="injuries-employees" 
                      unit=""
                      info="Total recordable work-related injuries for employees"
                    />
                    <FormField 
                      label="Recordable Work-Related Injuries (Workers)" 
                      id="injuries-workers" 
                      unit=""
                      info="Total recordable work-related injuries for contract workers"
                    />
                    <FormField 
                      label="Fatalities (Employees)" 
                      id="fatalities-employees" 
                      unit=""
                      info="Number of work-related fatalities for employees"
                    />
                    <FormField 
                      label="Fatalities (Workers)" 
                      id="fatalities-workers" 
                      unit=""
                      info="Number of work-related fatalities for contract workers"
                    />
                    <FormField 
                      label="Man-Hours Worked (Employees)" 
                      id="manhours-employees" 
                      unit="Man-Hours"
                      info="Total man-hours worked by employees"
                    />
                    <FormField 
                      label="Man-Hours Worked (Workers)" 
                      id="manhours-workers" 
                      unit="Man-Hours"
                      info="Total man-hours worked by contract workers"
                    />
                  </div>
                </Section>
                
                <Section title="Complaints & Grievances" sectionKey="complaintsGrievances">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Number of Workplace Complaints" 
                      id="workplace-complaints" 
                      unit=""
                      info="Complaints related to health & safety, working conditions, discrimination, harassment, wages, etc."
                    />
                    <FormField 
                      label="Number of Consumer Complaints" 
                      id="consumer-complaints" 
                      unit=""
                      info="Complaints related to data privacy, cybersecurity, product safety, etc."
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
                      id="board-members" 
                      unit=""
                      info="Total number of board members"
                    />
                    <FormField 
                      label="Percentage of Women on Board" 
                      id="women-percentage" 
                      unit="%"
                      info="Percentage of board members who are women"
                    />
                    
                    <div className="col-span-full">
                      <p className="font-medium mb-3">Board Members by Age Group (%)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField 
                          label="Under 30 Years" 
                          id="board-under30" 
                          unit="%"
                          info="Percentage of board members under 30 years old"
                        />
                        <FormField 
                          label="Between 30 and 50 Years" 
                          id="board-30to50" 
                          unit="%"
                          info="Percentage of board members between 30 and 50 years old"
                        />
                        <FormField 
                          label="Above 50 Years" 
                          id="board-above50" 
                          unit="%"
                          info="Percentage of board members above 50 years old"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-full">
                      <p className="font-medium mb-3">Board Members by Experience Level (%)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField 
                          label="Under 5 Years Experience" 
                          id="exp-under5" 
                          unit="%"
                          info="Percentage of board members with less than 5 years of experience"
                        />
                        <FormField 
                          label="Between 5 and 10 Years" 
                          id="exp-5to10" 
                          unit="%"
                          info="Percentage of board members with 5-10 years of experience"
                        />
                        <FormField 
                          label="Above 10 Years Experience" 
                          id="exp-above10" 
                          unit="%"
                          info="Percentage of board members with more than 10 years of experience"
                        />
                      </div>
                    </div>
                  </div>
                </Section>
                
                <Section title="Cybersecurity & Data Privacy" sectionKey="cybersecurity">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Number of Data Privacy or Cybersecurity Incidents" 
                      id="cybersecurity-incidents" 
                      unit=""
                      info="Total number of data privacy or cybersecurity incidents during the reporting period"
                    />
                  </div>
                </Section>
                
                <Section title="Business Ethics & Compliance" sectionKey="businessEthics">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <FormField 
                      label="Number of Corruption and Bribery Incidents" 
                      id="corruption-incidents" 
                      unit=""
                      info="Total number of corruption and bribery incidents during the reporting period"
                    />
                    <FormField 
                      label="Number of Legal Fines or Penalties" 
                      id="legal-fines" 
                      unit=""
                      info="Total number of legal fines or penalties during the reporting period"
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
            >
              <Save size={16} />
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-esg-blue hover:bg-esg-blue/90"
            >
              <Send size={16} />
              Submit for Approval
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default FormEntry;
