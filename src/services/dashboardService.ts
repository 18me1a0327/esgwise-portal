
import { supabase } from "@/integrations/supabase/client";

export const fetchDashboardData = async (siteId = "all", timeframe = "quarter") => {
  // Determine date range based on timeframe
  const now = new Date();
  let startDate = new Date();
  
  if (timeframe === "quarter") {
    startDate.setMonth(now.getMonth() - 3);
  } else if (timeframe === "year") {
    startDate.setFullYear(now.getFullYear() - 1);
  } else if (timeframe === "month") {
    startDate.setMonth(now.getMonth() - 1);
  } else if (timeframe === "custom") {
    // For custom, we'll use last 6 months as default
    startDate.setMonth(now.getMonth() - 6);
  }
  
  const startDateStr = startDate.toISOString().split('T')[0];

  // Build site filter condition
  let siteFilter = {};
  if (siteId !== "all") {
    siteFilter = { site_id: siteId };
  }

  // Fetch approved submissions with date and site filtering
  const { data: submissions, error: submissionsError } = await supabase
    .from('esg_submissions')
    .select(`
      id,
      site_id,
      period_start,
      period_end,
      sites(name)
    `)
    .eq('status', 'approved')
    .gte('period_end', startDateStr)
    .match(siteFilter)
    .order('period_end', { ascending: true });

  if (submissionsError) {
    console.error('Error fetching approved submissions:', submissionsError);
    throw new Error('Failed to fetch approved submissions');
  }

  // If no approved submissions, return empty data
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      totalEmissions: 0,
      renewablePercentage: 0,
      siteStats: [],
      environmentalData: [],
      socialData: [],
      emissionFactors: [],
      chartData: {
        energyData: [],
        emissionsData: [],
        waterData: [],
        wasteData: [],
        carbonEmissionsData: []
      }
    };
  }

  // Fetch environmental data for approved submissions
  const { data: environmentalData, error: envError } = await supabase
    .from('environmental_data')
    .select(`
      *,
      submission:esg_submissions(
        id,
        site_id,
        period_start,
        period_end,
        sites(name)
      )
    `)
    .in('submission_id', submissions?.map(s => s.id) || []);

  if (envError) {
    console.error('Error fetching environmental data:', envError);
    throw new Error('Failed to fetch environmental data');
  }

  // Fetch social data for approved submissions
  const { data: socialData, error: socialError } = await supabase
    .from('social_data')
    .select(`
      *,
      submission:esg_submissions(
        id,
        site_id,
        period_start,
        period_end,
        sites(name)
      )
    `)
    .in('submission_id', submissions?.map(s => s.id) || []);

  if (socialError) {
    console.error('Error fetching social data:', socialError);
    throw new Error('Failed to fetch social data');
  }

  // Get emission factors
  const { data: emissionFactors, error: factorsError } = await supabase
    .from('emission_factors')
    .select('*');

  if (factorsError) {
    console.error('Error fetching emission factors:', factorsError);
    throw new Error('Failed to fetch emission factors');
  }

  // Aggregated statistics
  const totalSubmissions = submissions?.length || 0;
  
  // Calculate total emissions across all sites
  const totalEmissions = environmentalData?.reduce((sum, item) => 
    sum + (Number(item.total_emissions) || 0), 0);
  
  // Calculate renewable percentage
  const totalElectricity = environmentalData?.reduce((sum, item) => 
    sum + (Number(item.total_electricity) || 0), 0);
  
  const renewableElectricity = environmentalData?.reduce((sum, item) => 
    sum + (Number(item.renewable_ppa) || 0) + (Number(item.renewable_rooftop) || 0), 0);
  
  const renewablePercentage = totalElectricity > 0 
    ? (renewableElectricity / totalElectricity) * 100 
    : 0;

  // Group data by month for charts
  const monthlyDataMap = new Map();
  const monthlyEmissionsMap = new Map();
  const monthlyWaterMap = new Map();
  const monthlyWasteMap = new Map();
  const monthlyCarbonMap = new Map();
  
  // Helper function to get month key (format: YYYY-MM)
  const getMonthKey = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Helper function to get display date (format: Month'YY)
  const getDisplayDate = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthAbbr = date.toLocaleString('default', { month: 'short' });
    const yearShort = date.getFullYear().toString().slice(2);
    return `${monthAbbr}'${yearShort}`;
  };

  // Process energy data grouped by month
  environmentalData?.forEach(item => {
    const monthKey = getMonthKey(item.submission.period_end);
    
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, {
        date: monthKey,
        displayDate: getDisplayDate(monthKey),
        totalElectricity: 0,
        renewableEnergy: 0,
        coal: 0,
        fossilFuels: 0
      });
    }
    
    const monthData = monthlyDataMap.get(monthKey);
    monthData.totalElectricity += Number(item.total_electricity) || 0;
    monthData.renewableEnergy += (Number(item.renewable_ppa) || 0) + (Number(item.renewable_rooftop) || 0);
    monthData.coal += Number(item.coal_consumption) || 0;
    monthData.fossilFuels += (Number(item.hsd_consumption) || 0) + 
                            (Number(item.furnace_oil_consumption) || 0) + 
                            (Number(item.petrol_consumption) || 0);
  });

  // Process emissions data grouped by month
  environmentalData?.forEach(item => {
    const monthKey = getMonthKey(item.submission.period_end);
    
    if (!monthlyEmissionsMap.has(monthKey)) {
      monthlyEmissionsMap.set(monthKey, {
        date: monthKey,
        displayDate: getDisplayDate(monthKey),
        NOx: 0,
        SOx: 0,
        PM: 0,
        Others: 0
      });
    }
    
    const monthData = monthlyEmissionsMap.get(monthKey);
    monthData.NOx += Number(item.nox) || 0;
    monthData.SOx += Number(item.sox) || 0;
    monthData.PM += Number(item.pm) || 0;
    monthData.Others += (Number(item.pop) || 0) + (Number(item.voc) || 0) + (Number(item.hap) || 0);
  });

  // Process water data grouped by month
  environmentalData?.forEach(item => {
    const monthKey = getMonthKey(item.submission.period_end);
    
    if (!monthlyWaterMap.has(monthKey)) {
      monthlyWaterMap.set(monthKey, {
        date: monthKey,
        displayDate: getDisplayDate(monthKey),
        Withdrawal: 0,
        ThirdParty: 0,
        Rainwater: 0,
        Recycled: 0,
        Discharged: 0
      });
    }
    
    const monthData = monthlyWaterMap.get(monthKey);
    monthData.Withdrawal += Number(item.water_withdrawal) || 0;
    monthData.ThirdParty += Number(item.third_party_water) || 0;
    monthData.Rainwater += Number(item.rainwater) || 0;
    monthData.Recycled += Number(item.recycled_wastewater) || 0;
    monthData.Discharged += Number(item.water_discharged) || 0;
  });

  // Process waste data grouped by month
  environmentalData?.forEach(item => {
    const monthKey = getMonthKey(item.submission.period_end);
    
    if (!monthlyWasteMap.has(monthKey)) {
      monthlyWasteMap.set(monthKey, {
        date: monthKey,
        displayDate: getDisplayDate(monthKey),
        Hazardous: 0,
        NonHazardous: 0,
        Plastic: 0,
        EWaste: 0,
        BioMedical: 0,
        WasteOil: 0
      });
    }
    
    const monthData = monthlyWasteMap.get(monthKey);
    monthData.Hazardous += Number(item.total_hazardous) || 0;
    monthData.NonHazardous += Number(item.non_hazardous) || 0;
    monthData.Plastic += Number(item.plastic_waste) || 0;
    monthData.EWaste += Number(item.e_waste) || 0;
    monthData.BioMedical += Number(item.bio_medical) || 0;
    monthData.WasteOil += Number(item.waste_oil) || 0;
  });

  // Process carbon emissions data grouped by month
  environmentalData?.forEach(item => {
    const monthKey = getMonthKey(item.submission.period_end);
    
    // Scope 1: Direct emissions from owned or controlled sources
    const scope1 = (Number(item.coal_emissions) || 0) + 
                  (Number(item.hsd_emissions) || 0) + 
                  (Number(item.furnace_oil_emissions) || 0) + 
                  (Number(item.petrol_emissions) || 0);
    
    // Scope 2: Indirect emissions from purchased electricity
    const scope2 = Number(item.electricity_emissions) || 0;
    
    // Scope 3: All other indirect emissions (estimated as 20% of scope 1+2 for this example)
    const scope3 = (scope1 + scope2) * 0.2;
    
    if (!monthlyCarbonMap.has(monthKey)) {
      monthlyCarbonMap.set(monthKey, {
        date: monthKey,
        displayDate: getDisplayDate(monthKey),
        scope1: 0,
        scope2: 0,
        scope3: 0,
        total: 0
      });
    }
    
    const monthData = monthlyCarbonMap.get(monthKey);
    monthData.scope1 += scope1;
    monthData.scope2 += scope2;
    monthData.scope3 += scope3;
    monthData.total += scope1 + scope2 + scope3;
  });

  // Convert maps to arrays and sort chronologically
  const energyData = Array.from(monthlyDataMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const emissionsData = Array.from(monthlyEmissionsMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const waterData = Array.from(monthlyWaterMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const wasteData = Array.from(monthlyWasteMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const carbonEmissionsData = Array.from(monthlyCarbonMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  // Fetch statistics by site
  const siteStats = submissions?.reduce((acc, submission) => {
    const siteId = submission.site_id;
    
    if (!acc[siteId]) {
      acc[siteId] = {
        siteId: siteId,
        siteName: submission.sites?.name,
        totalEmissions: 0,
        waterConsumption: 0,
        totalEmployees: 0
      };
    }
    
    const siteEnvData = environmentalData?.filter(data => 
      data.submission.site_id === siteId);
    
    const siteSocialData = socialData?.filter(data => 
      data.submission.site_id === siteId);
    
    acc[siteId].totalEmissions += siteEnvData?.reduce((sum, item) => 
      sum + (Number(item.total_emissions) || 0), 0) || 0;
    
    acc[siteId].waterConsumption += siteEnvData?.reduce((sum, item) => 
      sum + (Number(item.water_withdrawal) || 0), 0) || 0;
    
    if (siteSocialData?.[0]?.total_employees) {
      acc[siteId].totalEmployees = Math.max(acc[siteId].totalEmployees, siteSocialData[0].total_employees);
    }
    
    return acc;
  }, {});

  console.log('Dashboard data prepared:', { 
    totalSubmissions, 
    totalEmissions, 
    renewablePercentage, 
    siteStats: Object.values(siteStats).length,
    chartData: {
      energyData: energyData.length,
      emissionsData: emissionsData.length,
      waterData: waterData.length,
      wasteData: wasteData.length,
      carbonEmissionsData: carbonEmissionsData.length
    }
  });

  return {
    totalSubmissions,
    totalEmissions,
    renewablePercentage,
    siteStats: Object.values(siteStats) || [],
    chartData: {
      energyData,
      emissionsData,
      waterData,
      wasteData,
      carbonEmissionsData
    },
    environmentalData,
    socialData,
    emissionFactors
  };
};
