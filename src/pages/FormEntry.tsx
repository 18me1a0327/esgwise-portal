import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  fetchSites, 
  createESGSubmission, 
  updateESGSubmission, 
  fetchESGSubmissionDetails 
} from "@/services/esgSubmissionService";
import { 
  environmentalSchema, 
  socialSchema, 
  governanceSchema, 
  esgFormSchema,
  EnvironmentalData,
  SocialData,
  GovernanceData
} from "@/schemas/esg";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FormEntry = () => {
  const [activeTab, setActiveTab] = useState("environmental");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDraft, setIsDraft] = useState(false);

  const { data: sites, isLoading: isLoadingSites, error: sitesError } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSites
  });

  const { 
    data: submissionDetails, 
    isLoading: isLoadingSubmission, 
    error: submissionError 
  } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => id ? fetchESGSubmissionDetails(id) : null,
    enabled: !!id,
  });

  const form = useForm<typeof esgFormSchema>({
    resolver: zodResolver(esgFormSchema),
    defaultValues: {
      site_id: "",
      environmentalData: {
        total_electricity: undefined,
        renewable_ppa: undefined,
        renewable_rooftop: undefined,
        coal_consumption: undefined,
        hsd_consumption: undefined,
        furnace_oil_consumption: undefined,
        petrol_consumption: undefined,
        nox: undefined,
        sox: undefined,
        pm: undefined,
        water_withdrawal: undefined,
        third_party_water: undefined,
        rainwater: undefined,
        total_waste: undefined,
        total_hazardous: undefined,
        non_hazardous: undefined,
      },
      socialData: {
        total_employees: undefined,
        male_employees: undefined,
        female_employees: undefined,
        new_hires: undefined,
        attrition: undefined,
        health_insurance: undefined,
        accident_insurance: undefined,
        parental_benefits: undefined,
        pf_coverage: undefined,
      },
      governanceData: {
        board_members: undefined,
        women_percentage: undefined,
        board_under30: undefined,
        board_30to50: undefined,
        board_above50: undefined,
        cybersecurity_incidents: undefined,
        corruption_incidents: undefined,
        legal_fines: undefined,
      },
      submissionComment: "",
    },
  });

  useEffect(() => {
    if (submissionDetails) {
      form.reset({
        site_id: submissionDetails.site_id,
        environmentalData: submissionDetails.environmentalData,
        socialData: submissionDetails.socialData,
        governanceData: submissionDetails.governanceData,
        submissionComment: submissionDetails.submissionComment,
      });
    }
  }, [submissionDetails, form]);

  const submissionMutation = useMutation({
    mutationFn: async (data: typeof esgFormSchema) => {
      if (id) {
        return updateESGSubmission(id, data, isDraft ? 'draft' : 'pending');
      } else {
        return createESGSubmission(data, isDraft ? 'draft' : 'pending');
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Form ${id ? 'updated' : 'submitted'} successfully!`,
      });
      navigate("/approvals");
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: `Error submitting form: ${error instanceof Error ? error.message : 'Unknown error'}` });
    },
  });

  const onSubmit = async (data: typeof esgFormSchema) => {
    submissionMutation.mutate(data);
  };

  if (isLoadingSites || isLoadingSubmission) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading...
      </div>
    );
  }

  if (sitesError || submissionError) {
    return <div className="text-red-500">Error: {sitesError?.message || submissionError?.message}</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <GlassCard className="p-8">
        <h1 className="text-2xl font-bold mb-4">{id ? "Edit ESG Form" : "Enter ESG Form"}</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FormField
                control={form.control}
                name="site_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Site</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a site" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sites?.map((site) => (
                          <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Tabs defaultValue="environmental" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
              </TabsList>
              <TabsContent value="environmental">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="environmentalData.total_electricity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Electricity (kWh)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Total Electricity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.renewable_ppa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renewable Energy (PPA) (kWh)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Renewable Energy (PPA)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.renewable_rooftop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renewable Energy (Rooftop) (kWh)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Renewable Energy (Rooftop)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.coal_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coal Consumption (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Coal Consumption" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.hsd_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSD Consumption (KL)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="HSD Consumption" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.furnace_oil_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Furnace Oil Consumption (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Furnace Oil Consumption" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.petrol_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Petrol Consumption (KL)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Petrol Consumption" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.nox"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NOx (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="NOx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.sox"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SOx (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="SOx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.pm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PM (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.water_withdrawal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water Withdrawal (KL)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Water Withdrawal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.third_party_water"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Third-Party Water (KL)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Third-Party Water" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.rainwater"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rainwater Harvesting (KL)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Rainwater Harvesting" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.total_waste"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Waste (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Total Waste" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.total_hazardous"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Hazardous Waste (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Total Hazardous Waste" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environmentalData.non_hazardous"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Non-Hazardous Waste (MT)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Non-Hazardous Waste" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="social">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialData.total_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Employees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Total Employees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.male_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Male Employees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Male Employees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.female_employees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Female Employees</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Female Employees" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.new_hires"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Hires</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="New Hires" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.attrition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attrition</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Attrition" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.health_insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Insurance (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Health Insurance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.accident_insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Insurance (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Accident Insurance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.parental_benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parental Benefits (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Parental Benefits" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialData.pf_coverage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PF Coverage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="PF Coverage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="governance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="governanceData.board_members"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Board Members</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Board Members" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.women_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Women on Board (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Women on Board" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.board_under30"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Board Members Under 30 (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Board Members Under 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.board_30to50"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Board Members 30-50 (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Board Members 30-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.board_above50"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Board Members Above 50 (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Board Members Above 50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.cybersecurity_incidents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cybersecurity Incidents</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Cybersecurity Incidents" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.corruption_incidents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Corruption Incidents</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Corruption Incidents" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="governanceData.legal_fines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Fines</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Legal Fines" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <FormField
                control={form.control}
                name="submissionComment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any relevant comments about this submission."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  type="submit" 
                  onClick={() => setIsDraft(true)}
                  disabled={submissionMutation.isPending}
                >
                  {submissionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  onClick={() => setIsDraft(false)}
                  disabled={submissionMutation.isPending}
                >
                  {submissionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Form
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </GlassCard>
    </div>
  );
};

export default FormEntry;
