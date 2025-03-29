import { supabase } from "@/integrations/supabase/client";

export const fetchDashboardData = async (siteId: string = "all", timeframe: string = "quarter") => {
  console.log(`Fetching dashboard data for site: ${siteId}, timeframe: ${timeframe}`);
  
  try {
    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    if (timeframe === "quarter") {
      startDate.setMonth(endDate.getMonth() - 3);
    } else if (timeframe === "year") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (timeframe === "custom") {
      // For now, default to 6 months for custom
      startDate.setMonth(endDate.getMonth() - 6);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Base query for approved submissions in the date range
    let query = supabase
      .from('esg_submissions')
      .select(`
        id,
        period_start,
        period_end,
        sites(id, name)
      `)
      .eq('status', 'approved')
      .gte('period_start', startDateStr)
      .lte('period_end', endDateStr);
    
    // Filter by site if not "all"
    if (siteId !== "all") {
      query = query.eq('site_id', siteId);
    }
    
    const { data: submissions, error: submissionsError } = await query;
    
    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      throw submissionsError;
    }
    
    if (!submissions || submissions.length === 0) {
      console.log('No approved submissions found for the selected criteria');
      return {
        chartData: {
          energyData: [],
          emissionsData: [],
          waterData: [],
          wasteData: [],
          carbonEmissionsData: []
        },
        renewablePercentage: 0,
        environmentalData: [],
        socialData: [],
        governanceData: [],
        fugitiveEmissionsData: {
          r22: 0,
          r32: 0,
          r410: 0,
          r134a: 0,
          r514a: 0,
          co2Refilled: 0,
          total: 0
        }
      };
    }
    
    // Extract submission IDs
    const submissionIds = submissions.map(s => s.id);
    
    // Fetch environmental data for these submissions
    const { data: environmentalData, error: envError } = await supabase
      .from('environmental_data')
      .select('*')
      .in('submission_id', submissionIds);
    
    if (envError) {
      console.error('Error fetching environmental data:', envError);
      throw envError;
    }
    
    // Fetch social data
    const { data: socialData, error: socialError } = await supabase
      .from('social_data')
      .select(`
        *,
        submission:esg_submissions!inner(
          id,
          period_start,
          period_end,
          sites(id, name)
        )
      `)
      .in('submission_id', submissionIds);
    
    if (socialError) {
      console.error('Error fetching social data:', socialError);
      throw socialError;
    }
    
    // Fetch governance data
    const { data: governanceData, error: govError } = await supabase
      .from('governance_data')
      .select('*')
      .in('submission_id', submissionIds);
    
    if (govError) {
      console.error('Error fetching governance data:', govError);
      throw govError;
    }
    
    // Process environmental data for charts
    const processedChartData = processChartData(environmentalData, submissions);
    
    // Calculate renewable percentage
    const totalElectricity = environmentalData.reduce((sum, item) => sum + (Number(item.total_electricity) || 0), 0);
    const renewablePPA = environmentalData.reduce((sum, item) => sum + (Number(item.renewable_ppa) || 0), 0);
    const renewableRooftop = environmentalData.reduce((sum, item) => sum + (Number(item.renewable_rooftop) || 0), 0);
    
    const renewablePercentage = totalElectricity > 0 
      ? ((renewablePPA + renewableRooftop) / totalElectricity) * 100 
      : 0;
    
    // Process fugitive emissions data
    console.log("Processing fugitive emissions data from:", environmentalData);
    
    const fugitiveEmissionsData = {
      r22: 0,
      r32: 0,
      r410: 0,
      r134a: 0,
      r514a: 0,
      co2Refilled: 0,
      total: 0
    };
    
    environmentalData.forEach(item => {
      fugitiveEmissionsData.r22 += Number(item.r22_refrigerant || 0);
      fugitiveEmissionsData.r32 += Number(item.r32_refrigerant || 0);
      fugitiveEmissionsData.r410 += Number(item.r410_refrigerant || 0);
      fugitiveEmissionsData.r134a += Number(item.r134a_refrigerant || 0);
      fugitiveEmissionsData.r514a += Number(item.r514a_refrigerant || 0);
      fugitiveEmissionsData.co2Refilled += Number(item.co2_refilled || 0);
    });
    
    // Calculate total
    fugitiveEmissionsData.total = 
      fugitiveEmissionsData.r22 + 
      fugitiveEmissionsData.r32 + 
      fugitiveEmissionsData.r410 + 
      fugitiveEmissionsData.r134a + 
      fugitiveEmissionsData.r514a + 
      fugitiveEmissionsData.co2Refilled;
    
    console.log("Processed fugitive emissions data:", fugitiveEmissionsData);
    
    return {
      chartData: processedChartData,
      renewablePercentage,
      environmentalData,
      socialData,
      governanceData,
      fugitiveEmissionsData
    };
    
  } catch (error) {
    console.error('Error in fetchDashboardData:', error);
    throw error;
  }
};

// Helper function to process chart data
function processChartData(environmentalData, submissions) {
  const energyData = [];
  const emissionsData = [];
  const waterData = [];
  const wasteData = [];
  const carbonEmissionsData = [];
  
  // Sort submissions by period_start
  const sortedSubmissions = [...submissions].sort((a, b) => 
    new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
  );
  
  // Process each submission to create chart data points
  sortedSubmissions.forEach(submission => {
    // Find matching environmental data
    const envData = environmentalData.find(data => data.submission_id === submission.id);
    
    if (!envData) return;
    
    // Create date label
    const dateObj = new Date(submission.period_start);
    const monthAbbr = dateObj.toLocaleString('default', { month: 'short' });
    const yearShort = dateObj.getFullYear().toString().slice(2);
    const displayDate = `${monthAbbr}'${yearShort}`;
    
    // Energy data
    energyData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Total': Number(envData.total_electricity) || 0,
      'Grid': (Number(envData.total_electricity) || 0) - ((Number(envData.renewable_ppa) || 0) + (Number(envData.renewable_rooftop) || 0)),
      'Renewable PPA': Number(envData.renewable_ppa) || 0,
      'Renewable Rooftop': Number(envData.renewable_rooftop) || 0
    });
    
    // Emissions data
    emissionsData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'NOx': Number(envData.nox) || 0,
      'SOx': Number(envData.sox) || 0,
      'PM': Number(envData.pm) || 0,
      'Others': (Number(envData.voc) || 0) + (Number(envData.hap) || 0) + (Number(envData.pop) || 0)
    });
    
    // Water data
    waterData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Withdrawal': Number(envData.water_withdrawal) || 0,
      'ThirdParty': Number(envData.third_party_water) || 0,
      'Rainwater': Number(envData.rainwater) || 0,
      'Recycled': Number(envData.recycled_wastewater) || 0,
      'Discharged': Number(envData.water_discharged) || 0
    });
    
    // Waste data
    wasteData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Hazardous': Number(envData.total_hazardous) || 0,
      'NonHazardous': Number(envData.non_hazardous) || 0,
      'Plastic': Number(envData.plastic_waste) || 0,
      'EWaste': Number(envData.e_waste) || 0,
      'BioMedical': Number(envData.bio_medical) || 0,
      'WasteOil': Number(envData.waste_oil) || 0
    });
    
    // Carbon emissions data
    carbonEmissionsData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Electricity': Number(envData.electricity_emissions) || 0,
      'Coal': Number(envData.coal_emissions) || 0,
      'HSD': Number(envData.hsd_emissions) || 0,
      'Furnace Oil': Number(envData.furnace_oil_emissions) || 0,
      'Petrol': Number(envData.petrol_emissions) || 0
    });
  });
  
  return {
    energyData,
    emissionsData,
    waterData,
    wasteData,
    carbonEmissionsData
  };
}
