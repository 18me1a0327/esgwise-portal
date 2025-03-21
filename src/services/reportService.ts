
import { supabase } from "@/integrations/supabase/client";

export const fetchApprovedSubmissionsData = async () => {
  // Fetch all approved submissions
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

  // If no approved submissions, return empty data
  if (!submissions || submissions.length === 0) {
    return {
      submissions: [],
      environmentalData: [],
      socialData: [],
      governanceData: []
    };
  }

  // Fetch environmental data for approved submissions
  const { data: environmentalData, error: envError } = await supabase
    .from('environmental_data')
    .select(`
      *,
      submission:esg_submissions(
        id,
        period_start,
        period_end,
        sites(name)
      )
    `)
    .in('submission_id', submissions.map(s => s.id));

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
        period_start,
        period_end,
        sites(name)
      )
    `)
    .in('submission_id', submissions.map(s => s.id));

  if (socialError) {
    console.error('Error fetching social data:', socialError);
    throw new Error('Failed to fetch social data');
  }

  // Fetch governance data for approved submissions
  const { data: governanceData, error: govError } = await supabase
    .from('governance_data')
    .select(`
      *,
      submission:esg_submissions(
        id,
        period_start,
        period_end,
        sites(name)
      )
    `)
    .in('submission_id', submissions.map(s => s.id));

  if (govError) {
    console.error('Error fetching governance data:', govError);
    throw new Error('Failed to fetch governance data');
  }

  return {
    submissions,
    environmentalData: environmentalData || [],
    socialData: socialData || [],
    governanceData: governanceData || []
  };
};
