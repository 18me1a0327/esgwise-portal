
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormNumericInput } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/use-toast";

// Define schema with optional fields
const environmentalDataSchema = z.object({
  // Energy
  total_electricity: z.number().optional().nullable(),
  renewable_ppa: z.number().optional().nullable(),
  renewable_rooftop: z.number().optional().nullable(),
  coal_consumption: z.number().optional().nullable(),
  hsd_consumption: z.number().optional().nullable(),
  furnace_oil_consumption: z.number().optional().nullable(),
  petrol_consumption: z.number().optional().nullable(),
  i_recs: z.number().optional().nullable(),
  
  // Air Emissions
  nox: z.number().optional().nullable(),
  sox: z.number().optional().nullable(),
  pm: z.number().optional().nullable(),
  voc: z.number().optional().nullable(),
  hap: z.number().optional().nullable(),
  pop: z.number().optional().nullable(),
  
  // Water Management
  water_withdrawal: z.number().optional().nullable(),
  third_party_water: z.number().optional().nullable(),
  rainwater: z.number().optional().nullable(),
  wastewater_generated: z.number().optional().nullable(),
  recycled_wastewater: z.number().optional().nullable(),
  water_discharged: z.number().optional().nullable(),
  
  // Waste Management
  total_hazardous: z.number().optional().nullable(),
  hazardous_coprocessed: z.number().optional().nullable(),
  hazardous_incinerated: z.number().optional().nullable(),
  hazardous_landfill: z.number().optional().nullable(),
  non_hazardous: z.number().optional().nullable(),
  plastic_waste: z.number().optional().nullable(),
  e_waste: z.number().optional().nullable(),
  bio_medical: z.number().optional().nullable(),
  waste_oil: z.number().optional().nullable(),
  total_waste: z.number().optional().nullable(),
  
  // Fugitive emissions - Make sure these match the database column names
  r22_refrigerant: z.number().optional().nullable(),
  r32_refrigerant: z.number().optional().nullable(),
  r410_refrigerant: z.number().optional().nullable(),
  r134a_refrigerant: z.number().optional().nullable(),
  r514a_refrigerant: z.number().optional().nullable(),
  co2_refilled: z.number().optional().nullable(),
});

type EnvironmentalDataFormProps = {
  existingData?: any;
  onDataChange: (data: any) => void;
};

const EnvironmentalDataForm = ({ existingData, onDataChange }: EnvironmentalDataFormProps) => {
  const [activeTab, setActiveTab] = useState("energy");
  const { toast } = useToast();

  // Setup form with default values
  const form = useForm<z.infer<typeof environmentalDataSchema>>({
    resolver: zodResolver(environmentalDataSchema),
    defaultValues: {
      // Energy
      total_electricity: 0,
      renewable_ppa: 0,
      renewable_rooftop: 0,
      coal_consumption: 0,
      hsd_consumption: 0,
      furnace_oil_consumption: 0,
      petrol_consumption: 0,
      i_recs: 0,
      
      // Air Emissions
      nox: 0,
      sox: 0,
      pm: 0,
      voc: 0,
      hap: 0,
      pop: 0,
      
      // Water
      water_withdrawal: 0,
      third_party_water: 0,
      rainwater: 0,
      wastewater_generated: 0,
      recycled_wastewater: 0,
      water_discharged: 0,
      
      // Waste
      total_hazardous: 0,
      hazardous_coprocessed: 0,
      hazardous_incinerated: 0,
      hazardous_landfill: 0,
      non_hazardous: 0,
      plastic_waste: 0,
      e_waste: 0,
      bio_medical: 0,
      waste_oil: 0,
      total_waste: 0,
      
      // Fugitive emissions
      r22_refrigerant: 0,
      r32_refrigerant: 0,
      r410_refrigerant: 0,
      r134a_refrigerant: 0,
      r514a_refrigerant: 0,
      co2_refilled: 0,
    },
  });

  // Load existing data if available
  useEffect(() => {
    if (existingData) {
      console.log("Loading existing environmental data:", existingData);
      // Set form values from existing data
      const formValues = { ...form.getValues() };
      
      // Iterate over existing data keys and set form values
      Object.keys(existingData).forEach(key => {
        if (key in formValues) {
          formValues[key as keyof typeof formValues] = existingData[key] !== null 
            ? existingData[key] 
            : 0;
        }
      });
      
      // Special handling for fugitive emissions data
      console.log("Setting fugitive emissions form values:", {
        r22: existingData.r22_refrigerant,
        r32: existingData.r32_refrigerant,
        r410: existingData.r410_refrigerant,
        r134a: existingData.r134a_refrigerant,
        r514a: existingData.r514a_refrigerant,
        co2: existingData.co2_refilled
      });
      
      form.reset(formValues);
    }
  }, [existingData, form]);

  // Watch form values and notify parent component on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Log form data when it changes
      console.log("Environmental form data changed:", data);
      onDataChange(data);
    });
    
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  return (
    <GlassCard>
      <Form {...form}>
        <form className="space-y-6 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="air">Air Emissions</TabsTrigger>
              <TabsTrigger value="water">Water</TabsTrigger>
              <TabsTrigger value="waste">Waste</TabsTrigger>
              <TabsTrigger value="fugitive">Fugitive Emissions</TabsTrigger>
            </TabsList>

            {/* Energy Tab */}
            <TabsContent value="energy" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Energy Consumption</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_electricity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Electricity (MWh)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="renewable_ppa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renewable Energy - PPA (MWh)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="renewable_rooftop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renewable Energy - Rooftop (MWh)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="i_recs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I-RECs (MWh)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <h3 className="text-lg font-medium mt-6">Fuel Consumption</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coal_consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coal (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hsd_consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSD/Diesel (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="furnace_oil_consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Furnace Oil (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="petrol_consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Petrol (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Air Emissions Tab */}
            <TabsContent value="air" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Air Emissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nox"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NOx (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sox"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SOx (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Particulate Matter (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="voc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VOC (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HAP (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>POP (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            {/* Water Management Tab */}
            <TabsContent value="water" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Water Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="water_withdrawal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Water Withdrawal (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="third_party_water"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Third-party Water (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rainwater"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rainwater Harvested (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wastewater_generated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Wastewater Generated (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recycled_wastewater"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recycled Wastewater (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="water_discharged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Discharged (KL)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            {/* Waste Management Tab */}
            <TabsContent value="waste" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Waste Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_hazardous"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Hazardous Waste (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hazardous_coprocessed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazardous Waste - Coprocessed (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hazardous_incinerated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazardous Waste - Incinerated (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hazardous_landfill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazardous Waste - Landfill (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="non_hazardous"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Non-Hazardous Waste (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="plastic_waste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plastic Waste (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="e_waste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Waste (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio_medical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio-Medical Waste (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="waste_oil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Oil (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="total_waste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Waste Generated (MT)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            {/* Fugitive Emissions Tab */}
            <TabsContent value="fugitive" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Fugitive Emissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="r22_refrigerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R22 Refrigerant (kg)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="r32_refrigerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R32 Refrigerant (kg)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="r410_refrigerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R410 Refrigerant (kg)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="r134a_refrigerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R134A Refrigerant (kg)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="r514a_refrigerant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R514A Refrigerant (kg)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="co2_refilled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CO2 Refilled (kg)</FormLabel>
                      <FormControl>
                        <FormNumericInput
                          {...field}
                          value={field.value || 0}
                          onValueChange={(value) => field.onChange(value)}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </GlassCard>
  );
};

export default EnvironmentalDataForm;
