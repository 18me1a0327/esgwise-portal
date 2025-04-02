import { supabase } from "@/integrations/supabase/client";
import { ApprovalStatus } from "@/types/esg";

const convertParameterName = (name: string): string => {
  const specialColumnMappings: Record<string, string> = {
    'Particulate Matter': 'pm',
    'Total water withdrawal': 'water_withdrawal',
    'Third-party water usage': 'third_party_water',
    'Rainwater harvesting': 'rainwater',
    'Total wastewater generated': 'wastewater_generated',
    'Recycled wastewater': 'recycled_wastewater',
    'Water discharged to third parties': 'water_discharged',
    'Hazardous waste to landfill': 'hazardous_landfill',
    'Hazardous waste incineration': 'hazardous_incinerated',
    'Hazardous waste co-processing': 'hazardous_coprocessed',
    'Total hazardous waste': 'total_hazardous',
    'Plastic waste': 'plastic_waste',
    'Non-hazardous waste': 'non_hazardous',
    'Bio-medical waste': 'bio_medical',
    'E-waste': 'e_waste',
    'Waste oil': 'waste_oil',
    'Total waste generated': 'total_waste',
    'Electricity from Grid': 'total_electricity',
    'Renewable Electricity via PPA': 'renewable_ppa',
    'Renewable Electricity via rooftop solar': 'renewable_rooftop',
    'Coal consumption': 'coal_consumption',
    'HSD consumption': 'hsd_consumption',
    'Furnace Oil consumption': 'furnace_oil_consumption',
    'Petrol consumption': 'petrol_consumption',
    'R22 Refrigerant gas consumed': 'r22_refrigerant',
    'R32 Refrigerant gas consumed': 'r32_refrigerant',
    'R410 Refrigerant gas consumed': 'r410_refrigerant',
    'R134A Refrigerant gas consumed': 'r134a_refrigerant',
    'R514A Refrigerant gas consumed': 'r514a_refrigerant',
    'CO2 Refill Quantity': 'co2_refilled',
    'Number of workplace complaints': 'workplace_complaints',
    'Number of consumer complaints': 'consumer_complaints',
    'Total number of board members': 'board_members',
    'Percentage of female board members': 'women_percentage',
    'Board members under 30 years': 'board_under30',
    'Board members 30-50 years': 'board_30to50',
    'Board members above 50 years': 'board_above50',
    'Board members with <5 years experience': 'exp_under5',
    'Board members with 5-10 years experience': 'exp_5to10',
    'Board members with >10 years experience': 'exp_above10',
    'Number of data privacy or cybersecurity incidents': 'cybersecurity_incidents',
    'Number of corruption/bribery incidents': 'corruption_incidents',
    'Legal fines': 'legal_fines',
    'Total number of employees': 'total_employees',
    'Male employees': 'male_employees',
    'Female employees': 'female_employees',
    'Number of new hires': 'new_hires',
    'Number of contract workers (male)': 'contract_male',
    'Number of contract workers (female)': 'contract_female',
    'Attrition rate': 'attrition',
    'Health insurance coverage': 'health_insurance',
    'Accident insurance coverage': 'accident_insurance',
    'Maternity & paternity benefits': 'parental_benefits',
    'Provident Fund coverage': 'pf_coverage',
    'Gratuity coverage': 'gratuity_coverage',
    'ESI coverage': 'esi_coverage',
    'Median salary for male employees': 'median_male_salary',
    'Median salary for female employees': 'median_female_salary',
    'Female wages as a percentage of total wages': 'female_wages_percentage',
    'Performance and career reviews': 'performance_reviews',
    'GMP training hours': 'gmp_training',
    'EHS training hours': 'ehs_training',
    'Other training hours': 'other_training',
    'Number of reportable incidents (Employees)': 'reportable_employees',
    'Number of reportable incidents (Workers)': 'reportable_workers',
    'Work-related injuries (Employees)': 'injuries_employees',
    'Work-related injuries (Workers)': 'injuries_workers',
    'Number of fatalities (Employees)': 'fatalities_employees',
    'Number of fatalities (Workers)': 'fatalities_workers',
    'Total man-hours worked (Employees)': 'manhours_employees',
    'Total man-hours worked (Workers)': 'manhours_workers'
  };

  if (specialColumnMappings[name]) {
    return specialColumnMappings[name];
  }
  
  return name.toLowerCase().replace(/\s+/g, '_');
};

export const createSubmission = async (
  siteId: string, 
  periodStart: string, 
  periodEnd: string, 
  submittedBy: string,
  environmentalData: any,
  socialData: any,
  governanceData: any
) => {
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

  const processedEnvironmentalData: Record<string, any> = { submission_id: submissionId };
  for (const [paramName, value] of Object.entries(environmentalData)) {
    const columnName = convertParameterName(paramName);
    processedEnvironmentalData[columnName] = value;
  }

  const { error: envError } = await supabase
    .from('environmental_data')
    .insert(processedEnvironmentalData);

  if (envError) {
    console.error('Error adding environmental data:', envError);
    throw new Error('Failed to add environmental data');
  }

  const processedSocialData: Record<string, any> = { submission_id: submissionId };
  for (const [paramName, value] of Object.entries(socialData)) {
    const columnName = convertParameterName(paramName);
    processedSocialData[columnName] = value;
  }

  const { error: socialError } = await supabase
    .from('social_data')
    .insert(processedSocialData);

  if (socialError) {
    console.error('Error adding social data:', socialError);
    throw new Error('Failed to add social data');
  }

  const processedGovernanceData: Record<string, any> = { submission_id: submissionId };
  for (const [paramName, value] of Object.entries(governanceData)) {
    const columnName = convertParameterName(paramName);
    processedGovernanceData[columnName] = value;
  }

  const { error: govError } = await supabase
    .from('governance_data')
    .insert(processedGovernanceData);

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

  const processedEnvironmentalData: Record<string, any> = { submission_id: submissionId };
  for (const [paramName, value] of Object.entries(environmentalData)) {
    const columnName = convertParameterName(paramName);
    processedEnvironmentalData[columnName] = value;
  }

  const { error: envError } = await supabase
    .from('environmental_data')
    .insert(processedEnvironmentalData);

  if (envError) {
    console.error('Error adding environmental data:', envError);
    throw new Error('Failed to add environmental data');
  }

  const processedSocialData: Record<string, any> = { submission_id: submissionId };
  for (const [paramName, value] of Object.entries(socialData)) {
    const columnName = convertParameterName(paramName);
    processedSocialData[columnName] = value;
  }

  const { error: socialError } = await supabase
    .from('social_data')
    .insert(processedSocialData);

  if (socialError) {
    console.error('Error adding social data:', socialError);
    throw new Error('Failed to add social data');
  }

  const processedGovernanceData: Record<string, any> = { submission_id: submissionId };
  for (const [paramName, value] of Object.entries(governanceData)) {
    const columnName = convertParameterName(paramName);
    processedGovernanceData[columnName] = value;
  }

  const { error: govError } = await supabase
    .from('governance_data')
    .insert(processedGovernanceData);

  if (govError) {
    console.error('Error adding governance data:', govError);
    throw new Error('Failed to add governance data');
  }

  return { submissionId };
};

export const updateDraftSubmission = async (
  submissionId: string,
  environmentalData: any,
  socialData: any,
  governanceData: any
) => {
  const processedEnvironmentalData: Record<string, any> = {};
  for (const [paramName, value] of Object.entries(environmentalData)) {
    const columnName = convertParameterName(paramName);
    processedEnvironmentalData[columnName] = value;
  }

  const { error: envError } = await supabase
    .from('environmental_data')
    .update(processedEnvironmentalData)
    .eq('submission_id', submissionId);

  if (envError) {
    console.error('Error updating environmental data:', envError);
    throw new Error('Failed to update environmental data');
  }

  const processedSocialData: Record<string, any> = {};
  for (const [paramName, value] of Object.entries(socialData)) {
    const columnName = convertParameterName(paramName);
    processedSocialData[columnName] = value;
  }

  const { error: socialError } = await supabase
    .from('social_data')
    .update(processedSocialData)
    .eq('submission_id', submissionId);

  if (socialError) {
    console.error('Error updating social data:', socialError);
    throw new Error('Failed to update social data');
  }

  const processedGovernanceData: Record<string, any> = {};
  for (const [paramName, value] of Object.entries(governanceData)) {
    const columnName = convertParameterName(paramName);
    processedGovernanceData[columnName] = value;
  }

  const { error: govError } = await supabase
    .from('governance_data')
    .update(processedGovernanceData)
    .eq('submission_id', submissionId);

  if (govError) {
    console.error('Error updating governance data:', govError);
    throw new Error('Failed to update governance data');
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

  const transformedData = data?.map(submission => ({
    ...submission,
    status: submission.status as ApprovalStatus
  })) || [];

  return transformedData;
};

export const fetchSubmissionDetails = async (submissionId: string) => {
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

  const transformedSubmission = {
    ...submission,
    status: submission.status as ApprovalStatus
  };

  const { data: environmentalData, error: envError } = await supabase
    .from('environmental_data')
    .select('*')
    .eq('submission_id', submissionId)
    .single();

  if (envError && envError.code !== 'PGRST116') {
    console.error('Error fetching environmental data:', envError);
    throw new Error('Failed to fetch environmental data');
  }

  const { data: socialData, error: socialError } = await supabase
    .from('social_data')
    .select('*')
    .eq('submission_id', submissionId)
    .single();

  if (socialError && socialError.code !== 'PGRST116') {
    console.error('Error fetching social data:', socialError);
    throw new Error('Failed to fetch social data');
  }

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
