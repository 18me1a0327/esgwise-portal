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

export const getSubmissionsForApproval = async () => {
  const { data, error } = await supabase
    .from('esg_submissions')
    .select(`
      *,
      site:sites(*)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions for approval:', error);
    throw new Error('Failed to fetch submissions for approval');
  }

  return data.map(submission => ({
    id: submission.id,
    siteName: submission.site ? submission.site.name : 'Unknown Site',
    period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
    submittedBy: submission.submitted_by,
    status: submission.status as ApprovalStatus,
    submittedAt: submission.submitted_at,
    approvedAt: submission.status === 'approved' ? submission.reviewed_at : null,
    rejectedAt: submission.status === 'rejected' ? submission.reviewed_at : null,
    reviewer: submission.reviewer,
    reviewComment: submission.review_comment,
    siteId: submission.site_id,
    data: null
  }));
};

export const approveSubmission = async (submissionId: string) => {
  return updateSubmissionStatus(
    submissionId, 
    'approved', 
    'Admin User',
    'Approved after review'
  );
};

export const rejectSubmission = async (submissionId: string, reason: string = 'Did not meet requirements') => {
  return updateSubmissionStatus(
    submissionId, 
    'rejected', 
    'Admin User',
    reason
  );
};

export const getSubmissionById = async (submissionId: string) => {
  const { submission, environmentalData, socialData, governanceData } = await fetchSubmissionDetails(submissionId);
  
  return {
    id: submission.id,
    siteName: submission.site ? submission.site.name : 'Unknown Site',
    period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
    submittedBy: submission.submitted_by,
    status: submission.status as ApprovalStatus,
    submittedAt: submission.submitted_at,
    approvedAt: submission.status === 'approved' ? submission.reviewed_at : null,
    rejectedAt: submission.status === 'rejected' ? submission.reviewed_at : null,
    reviewer: submission.reviewer,
    reviewComment: submission.review_comment,
    siteId: submission.site_id,
    data: {
      total_electricity: environmentalData.total_electricity,
      renewable_ppa: environmentalData.renewable_ppa,
      renewable_rooftop: environmentalData.renewable_rooftop,
      coal_consumption: environmentalData.coal_consumption,
      hsd_consumption: environmentalData.hsd_consumption,
      nox: environmentalData.nox,
      sox: environmentalData.sox,
      pm: environmentalData.pm,
      water_withdrawal: environmentalData.water_withdrawal,
      third_party_water: environmentalData.third_party_water,
      rainwater: environmentalData.rainwater,
      water_discharged: environmentalData.water_discharged,
      total_hazardous: environmentalData.total_hazardous,
      non_hazardous: environmentalData.non_hazardous,
      plastic_waste: environmentalData.plastic_waste,
      e_waste: environmentalData.e_waste,
      
      total_employees: socialData.total_employees,
      male_employees: socialData.male_employees,
      female_employees: socialData.female_employees,
      contract_male: socialData.contract_male,
      contract_female: socialData.contract_female,
      injuries_employees: socialData.injuries_employees,
      injuries_workers: socialData.injuries_workers,
      fatalities_employees: socialData.fatalities_employees,
      fatalities_workers: socialData.fatalities_workers,
      ehs_training: socialData.ehs_training,
      gmp_training: socialData.gmp_training,
      other_training: socialData.other_training,
      pf_coverage: socialData.pf_coverage,
      esi_coverage: socialData.esi_coverage,
      health_insurance: socialData.health_insurance,
      parental_benefits: socialData.parental_benefits,
      
      board_members: governanceData.board_members,
      women_percentage: governanceData.women_percentage,
      board_under30: governanceData.board_under30,
      board_30to50: governanceData.board_30to50,
      board_above50: governanceData.board_above50,
      exp_under5: governanceData.exp_under5,
      exp_5to10: governanceData.exp_5to10,
      exp_above10: governanceData.exp_above10,
      legal_fines: governanceData.legal_fines,
      corruption_incidents: governanceData.corruption_incidents,
      cybersecurity_incidents: governanceData.cybersecurity_incidents
    }
  };
};

export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'approver';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
};

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    last_login: '2023-08-15T14:30:00Z'
  },
  {
    id: '2',
    username: 'approver1',
    email: 'approver@example.com',
    role: 'approver',
    status: 'active',
    created_at: '2023-02-15T00:00:00Z',
    last_login: '2023-08-10T09:45:00Z'
  },
  {
    id: '3',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    status: 'active',
    created_at: '2023-03-20T00:00:00Z',
    last_login: '2023-08-14T16:20:00Z'
  },
  {
    id: '4',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    status: 'inactive',
    created_at: '2023-04-05T00:00:00Z'
  }
];

export const fetchUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 500);
  });
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedUsers = mockUsers.map(user => 
        user.id === userId ? { ...user, status } : user
      );
      const updatedUser = updatedUsers.find(user => user.id === userId);
      if (!updatedUser) throw new Error('User not found');
      resolve(updatedUser);
    }, 500);
  });
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user' | 'approver'): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedUsers = mockUsers.map(user => 
        user.id === userId ? { ...user, role } : user
      );
      const updatedUser = updatedUsers.find(user => user.id === userId);
      if (!updatedUser) throw new Error('User not found');
      resolve(updatedUser);
    }, 500);
  });
};

export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        ...user,
        id: Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString()
      };
      mockUsers.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(user => user.id === userId);
      if (index !== -1) {
        mockUsers.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};
