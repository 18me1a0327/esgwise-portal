
import { supabase } from "@/integrations/supabase/client";

// Category types
export type CategoryType = 'environmental' | 'social' | 'governance';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface Parameter {
  id: string;
  name: string;
  unit: string | null;
  category_id: string;
  subcategory_id: string;
  created_at: string;
  updated_at: string;
}

// Category functions
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchCategoriesByType = async (type: CategoryType): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const createCategory = async (name: string, type: CategoryType): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, type }])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const updateCategory = async (id: string, name: string, type: CategoryType): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, type })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};

// Subcategory functions
export const fetchSubcategories = async (): Promise<Subcategory[]> => {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchSubcategoriesByCategory = async (categoryId: string): Promise<Subcategory[]> => {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const createSubcategory = async (name: string, categoryId: string): Promise<Subcategory> => {
  const { data, error } = await supabase
    .from('subcategories')
    .insert([{ name, category_id: categoryId }])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const updateSubcategory = async (id: string, name: string, categoryId: string): Promise<Subcategory> => {
  const { data, error } = await supabase
    .from('subcategories')
    .update({ name, category_id: categoryId })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const deleteSubcategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};

// Parameter functions
export const fetchParameters = async (): Promise<Parameter[]> => {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchParametersBySubcategory = async (subcategoryId: string): Promise<Parameter[]> => {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .eq('subcategory_id', subcategoryId)
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const createParameter = async (
  name: string, 
  unit: string | null, 
  categoryId: string, 
  subcategoryId: string
): Promise<Parameter> => {
  const { data, error } = await supabase
    .from('parameters')
    .insert([{ 
      name, 
      unit, 
      category_id: categoryId, 
      subcategory_id: subcategoryId 
    }])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const updateParameter = async (
  id: string,
  name: string, 
  unit: string | null, 
  categoryId: string, 
  subcategoryId: string
): Promise<Parameter> => {
  const { data, error } = await supabase
    .from('parameters')
    .update({ 
      name, 
      unit, 
      category_id: categoryId, 
      subcategory_id: subcategoryId 
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const deleteParameter = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('parameters')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};
