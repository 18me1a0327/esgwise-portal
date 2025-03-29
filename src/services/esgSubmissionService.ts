import { supabase } from "@/integrations/supabase/client";
import { ApprovalStatus } from "@/types/esg";

export const createSubmission = async (
  siteId: string, 
  periodStart: string, 
  periodEnd: string, 
  submittedBy: string,
  environmentalData: any,
  socialData: any,
  governanceData: any
) => {
  console.log("Creating submission with environmental data:", environmentalData);
  
  // Begin a transaction by starting with the main submission
  const { data: submission, error: submissionError } = await supabase
    .from('esg_submissions')
    .insert({
      site_id: siteId,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'pending',
      submitted_by: submittedBy
    })
    .select();

  if (submissionError) {
    console.error('Error creating submission:', submissionError);
    throw new Error('Failed to create submission');
  }

  const submissionId = submission?.[0]?.id;
  
  if (!submissionId) {
    throw new Error('No submission ID returned');
  }

  // Add environmental data
  const { error: envError } = await supabase
    .from('environmental_data')
    .insert({
      submission_id: submissionId,
      ...environmentalData
    });

  if (envError) {
    console.error('Error adding environmental data:', envError);
    console.error('Environmental data attempted to submit:', environmentalData);
    throw new Error('Failed to add environmental data: ' + envError.message);
  }

  // Add social data
  const { error: socialError } = await supabase
    .from('social_data')
    .insert({
      submission_id: submissionId,
      ...socialData
    });

  if (socialError) {
    console.error('Error adding social data:', socialError);
    throw new Error('Failed to add social data');
  }

  // Add governance data
  const { error: govError } = await supabase
    .from('governance_data')
    .insert({
      submission_id: submissionId,
      ...governanceData
    });

  if (govError) {
    console.error('Error adding governance data:', govError);
    throw new Error('Failed to add governance data');
  }

  return { submissionId };
};

export const saveAsDraft = async (
  siteId: string, 
  periodStart: string, 
  periodEnd: string, 
  submittedBy: string,
  environmentalData: any,
  socialData: any,
  governanceData: any
) => {
  // Same process but with draft status
  const { data: submission, error: submissionError } = await supabase
    .from('esg_submissions')
    .insert({
      site_id: siteId,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'draft',
      submitted_by: submittedBy
    })
    .select();

  if (submissionError) {
    console.error('Error creating draft:', submissionError);
    throw new Error('Failed to create draft');
  }

  const submissionId = submission?.[0]?.id;
  
  if (!submissionId) {
    throw new Error('No submission ID returned');
  }

  // Add environmental data
  const { error: envError } = await supabase
    .from('environmental_data')
    .insert({
      submission_id: submissionId,
      ...environmentalData
    });

  if (envError) {
    console.error('Error adding environmental data:', envError);
    throw new Error('Failed to add environmental data');
  }

  // Add social data
  const { error: socialError } = await supabase
    .from('social_data')
    .insert({
      submission_id: submissionId,
      ...socialData
    });

  if (socialError) {
    console.error('Error adding social data:', socialError);
    throw new Error('Failed to add social data');
  }

  // Add governance data
  const { error: govError } = await supabase
    .from('governance_data')
    .insert({
      submission_id: submissionId,
      ...governanceData
    });

  if (govError) {
    console.error('Error adding governance data:', govError);
    throw new Error('Failed to add governance data');
  }

  return { submissionId };
};

export const updateSubmissionStatus = async (
  submissionId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'draft',
  reviewer: string,
  comment?: string
) => {
  const { data, error } = await supabase
    .from('esg_submissions')
    .update({
      status,
      reviewer,
      review_comment: comment || null,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select();

  if (error) {
    console.error('Error updating submission status:', error);
    throw new Error('Failed to update submission status');
  }

  return data?.[0];
};

export const fetchSubmissions = async () => {
  const { data, error } = await supabase
    .from('esg_submissions')
    .select(`
      *,
      site:sites(*)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    throw new Error('Failed to fetch submissions');
  }

  // Transform the data to ensure status is of type ApprovalStatus
  const transformedData = data?.map(submission => ({
    ...submission,
    status: submission.status as ApprovalStatus
  })) || [];

  return transformedData;
};

export const fetchSubmissionDetails = async (submissionId: string) => {
  // Fetch the submission with site info
  const { data: submission, error: submissionError } = await supabase
    .from('esg_submissions')
    .select(`
      *,
      site:sites(*)
    `)
    .eq('id', submissionId)
    .single();

  if (submissionError) {
    console.error('Error fetching submission:', submissionError);
    throw new Error('Failed to fetch submission');
  }

  // Transform status to ApprovalStatus type
  const transformedSubmission = {
    ...submission,
    status: submission.status as ApprovalStatus
  };

  // Fetch environmental data
  const { data: environmentalData, error: envError } = await supabase
    .from('environmental_data')
    .select('*')
    .eq('submission_id', submissionId)
    .single();

  if (envError && envError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching environmental data:', envError);
    throw new Error('Failed to fetch environmental data');
  }

  // Log the environmental data to check for fugitive emissions values
  if (environmentalData) {
    console.log("Fetched environmental data with fugitive emissions:", {
      r22: environmentalData.r22_refrigerant,
      r32: environmentalData.r32_refrigerant,
      r410: environmentalData.r410_refrigerant,
      r134a: environmentalData.r134a_refrigerant,
      r514a: environmentalData.r514a_refrigerant,
      co2: environmentalData.co2_refilled
    });
  }

  // Fetch social data
  const { data: socialData, error: socialError } = await supabase
    .from('social_data')
    .select('*')
    .eq('submission_id', submissionId)
    .single();

  if (socialError && socialError.code !== 'PGRST116') {
    console.error('Error fetching social data:', socialError);
    throw new Error('Failed to fetch social data');
  }

  // Fetch governance data
  const { data: governanceData, error: govError } = await supabase
    .from('governance_data')
    .select('*')
    .eq('submission_id', submissionId)
    .single();

  if (govError && govError.code !== 'PGRST116') {
    console.error('Error fetching governance data:', govError);
    throw new Error('Failed to fetch governance data');
  }

  return {
    submission: transformedSubmission,
    environmentalData: environmentalData || {},
    socialData: socialData || {},
    governanceData: governanceData || {}
  };
};
