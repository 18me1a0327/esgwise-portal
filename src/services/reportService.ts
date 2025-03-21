
import { supabase } from "@/integrations/supabase/client";

export type ReportSite = {
  id: string;
  name: string;
};

export type ApprovedSubmission = {
  id: string;
  site_id: string;
  site_name: string;
  period_start: string;
  period_end: string;
  submitted_at: string;
  reviewed_at: string;
};

export type ReportEnvironmentalData = {
  id: string;
  submission_id: string;
  total_electricity: number | null;
  renewable_ppa: number | null;
  renewable_rooftop: number | null;
  coal_consumption: number | null;
  hsd_consumption: number | null;
  furnace_oil_consumption: number | null;
  petrol_consumption: number | null;
  total_emissions: number | null;
  water_withdrawal: number | null;
  wastewater_generated: number | null;
  total_waste: number | null;
};

export type ReportSocialData = {
  id: string;
  submission_id: string;
  total_employees: number | null;
  female_employees: number | null;
  male_employees: number | null;
  new_hires: number | null;
  attrition: number | null;
  injuries_employees: number | null;
  fatalities_employees: number | null;
  workplace_complaints: number | null;
};

export type ReportGovernanceData = {
  id: string;
  submission_id: string;
  board_members: number | null;
  women_percentage: number | null;
  legal_fines: number | null;
  corruption_incidents: number | null;
  cybersecurity_incidents: number | null;
};

export const getReportSites = async (): Promise<ReportSite[]> => {
  const { data, error } = await supabase
    .from("sites")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching sites:", error);
    throw error;
  }

  return data || [];
};

export const getApprovedSubmissions = async (siteId?: string): Promise<ApprovedSubmission[]> => {
  let query = supabase
    .from("esg_submissions")
    .select(`
      id,
      site_id,
      sites(name),
      period_start,
      period_end,
      submitted_at,
      reviewed_at
    `)
    .eq("status", "approved");

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { data, error } = await query.order("reviewed_at", { ascending: false });

  if (error) {
    console.error("Error fetching approved submissions:", error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    site_id: item.site_id,
    site_name: item.sites?.name || "Unknown Site",
    period_start: item.period_start,
    period_end: item.period_end,
    submitted_at: item.submitted_at,
    reviewed_at: item.reviewed_at
  }));
};

export const getEnvironmentalReportData = async (submissionIds: string[]): Promise<ReportEnvironmentalData[]> => {
  if (submissionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("environmental_data")
    .select(`
      id,
      submission_id,
      total_electricity,
      renewable_ppa,
      renewable_rooftop,
      coal_consumption,
      hsd_consumption,
      furnace_oil_consumption,
      petrol_consumption,
      total_emissions,
      water_withdrawal,
      wastewater_generated,
      total_waste
    `)
    .in("submission_id", submissionIds);

  if (error) {
    console.error("Error fetching environmental report data:", error);
    throw error;
  }

  return data || [];
};

export const getSocialReportData = async (submissionIds: string[]): Promise<ReportSocialData[]> => {
  if (submissionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("social_data")
    .select(`
      id,
      submission_id,
      total_employees,
      female_employees,
      male_employees,
      new_hires,
      attrition,
      injuries_employees,
      fatalities_employees,
      workplace_complaints
    `)
    .in("submission_id", submissionIds);

  if (error) {
    console.error("Error fetching social report data:", error);
    throw error;
  }

  return data || [];
};

export const getGovernanceReportData = async (submissionIds: string[]): Promise<ReportGovernanceData[]> => {
  if (submissionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("governance_data")
    .select(`
      id,
      submission_id,
      board_members,
      women_percentage,
      legal_fines,
      corruption_incidents,
      cybersecurity_incidents
    `)
    .in("submission_id", submissionIds);

  if (error) {
    console.error("Error fetching governance report data:", error);
    throw error;
  }

  return data || [];
};
