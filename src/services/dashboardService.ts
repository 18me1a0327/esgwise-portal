
import { supabase } from "@/integrations/supabase/client";

export const fetchDashboardData = async () => {
  // Fetch approved submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('esg_submissions')
    .select(`
      id,
      site_id,
      period_start,
      period_end,
      sites(name)
    `)
    .eq('status', 'approved');

  if (submissionsError) {
    console.error('Error fetching approved submissions:', submissionsError);
    throw new Error('Failed to fetch approved submissions');
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

  // Fetch statistics by site
  const siteStats = submissions?.map(submission => {
    const siteEnvData = environmentalData?.filter(data => 
      data.submission.site_id === submission.site_id);
    
    const siteSocialData = socialData?.filter(data => 
      data.submission.site_id === submission.site_id);
    
    const siteEmissions = siteEnvData?.reduce((sum, item) => 
      sum + (Number(item.total_emissions) || 0), 0);
    
    return {
      siteId: submission.site_id,
      siteName: submission.sites?.name,
      totalEmissions: siteEmissions || 0,
      waterConsumption: siteEnvData?.reduce((sum, item) => 
        sum + (Number(item.water_withdrawal) || 0), 0) || 0,
      totalEmployees: siteSocialData?.[0]?.total_employees || 0
    };
  });

  return {
    totalSubmissions,
    totalEmissions,
    renewablePercentage,
    siteStats,
    environmentalData,
    socialData,
    emissionFactors
  };
};
