
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

export const createSite = async (name: string) => {
  const { data, error } = await supabase
    .from('sites')
    .insert({ name })
    .select();

  if (error) {
    console.error('Error creating site:', error);
    throw new Error('Failed to create site');
  }

  return data?.[0];
};

export const updateSite = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('sites')
    .update({ name })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating site:', error);
    throw new Error('Failed to update site');
  }

  return data?.[0];
};

export const deleteSite = async (id: string) => {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting site:', error);
    throw new Error('Failed to delete site');
  }
};
