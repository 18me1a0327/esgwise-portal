
import { supabase } from "@/integrations/supabase/client";

export const fetchSites = async () => {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching sites:', error);
    throw new Error('Failed to fetch sites');
  }

  return data || [];
};

export const getSiteById = async (id: string) => {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching site:', error);
    throw new Error('Failed to fetch site');
  }

  return data;
};
