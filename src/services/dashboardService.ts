
import { supabase } from "@/integrations/supabase/client";
import { calculateDateRange } from "@/utils/dateUtils";
import { processChartData } from "@/services/chartDataService";
import { processFugitiveEmissions, calculateRenewablePercentage } from "@/services/emissionsService";

/**
 * Fetches dashboard data based on site and timeframe
 * @param siteId Site ID to filter by, or "all" for all sites
 * @param timeframe Time period to filter by (quarter, year, custom)
 * @returns Dashboard data including charts, statistics, and ESG metrics
 */
export const fetchDashboardData = async (siteId: string = "all", timeframe: string = "quarter") => {
  console.log(`Fetching dashboard data for site: ${siteId}, timeframe: ${timeframe}`);
  
  try {
    // Calculate date range based on timeframe
    const { startDate, endDate } = calculateDateRange(timeframe);
    
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
      return getEmptyDashboardData();
    }
    
    // Extract submission IDs
    const submissionIds = submissions.map(s => s.id);
    
    // Fetch data for these submissions in parallel
    const [environmentalData, socialData, governanceData] = await Promise.all([
      fetchEnvironmentalData(submissionIds),
      fetchSocialData(submissionIds),
      fetchGovernanceData(submissionIds)
    ]);
    
    // Log received data for debugging
    console.log('Environmental data received:', environmentalData);
    
    // Process data for charts
    const processedChartData = processChartData(environmentalData, submissions);
    
    // Calculate renewable percentage
    const renewablePercentage = calculateRenewablePercentage(environmentalData);
    
    // Process fugitive emissions data
    const fugitiveEmissionsData = processFugitiveEmissions(environmentalData);
    
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

/**
 * Fetches environmental data for given submission IDs
 * @param submissionIds Array of submission IDs
 * @returns Array of environmental data records
 */
const fetchEnvironmentalData = async (submissionIds: string[]) => {
  const { data, error } = await supabase
    .from('environmental_data')
    .select('*')
    .in('submission_id', submissionIds);
  
  if (error) {
    console.error('Error fetching environmental data:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Fetches social data for given submission IDs
 * @param submissionIds Array of submission IDs
 * @returns Array of social data records
 */
const fetchSocialData = async (submissionIds: string[]) => {
  const { data, error } = await supabase
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
  
  if (error) {
    console.error('Error fetching social data:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Fetches governance data for given submission IDs
 * @param submissionIds Array of submission IDs
 * @returns Array of governance data records
 */
const fetchGovernanceData = async (submissionIds: string[]) => {
  const { data, error } = await supabase
    .from('governance_data')
    .select('*')
    .in('submission_id', submissionIds);
  
  if (error) {
    console.error('Error fetching governance data:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Returns empty dashboard data structure
 * @returns Empty dashboard data object
 */
const getEmptyDashboardData = () => {
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
};
