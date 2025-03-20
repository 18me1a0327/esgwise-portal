
import { supabase } from "@/integrations/supabase/client";

export const fetchEmissionFactors = async () => {
  const { data, error } = await supabase
    .from('emission_factors')
    .select('*')
    .order('category')
    .order('item');

  if (error) {
    console.error('Error fetching emission factors:', error);
    throw new Error('Failed to fetch emission factors');
  }

  return data || [];
};

export const updateEmissionFactor = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('emission_factors')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating emission factor:', error);
    throw new Error('Failed to update emission factor');
  }

  return data?.[0];
};

export const createEmissionFactor = async (emissionFactor: any) => {
  const { data, error } = await supabase
    .from('emission_factors')
    .insert(emissionFactor)
    .select();

  if (error) {
    console.error('Error creating emission factor:', error);
    throw new Error('Failed to create emission factor');
  }

  return data?.[0];
};

export const deleteEmissionFactor = async (id: string) => {
  const { error } = await supabase
    .from('emission_factors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting emission factor:', error);
    throw new Error('Failed to delete emission factor');
  }

  return true;
};
