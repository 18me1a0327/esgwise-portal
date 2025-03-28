
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

export interface ESGParameterStructure {
  [categoryType: string]: {
    [categoryName: string]: {
      [subcategoryName: string]: {
        parameters: Parameter[];
      }
    }
  }
}

// Category functions
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  
  // Cast the 'type' field from string to CategoryType
  return (data || []).map(item => ({
    ...item,
    type: item.type as CategoryType
  }));
};

export const fetchCategoriesByType = async (type: CategoryType): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name');
  
  if (error) throw new Error(error.message);
  
  // Cast the 'type' field from string to CategoryType
  return (data || []).map(item => ({
    ...item,
    type: item.type as CategoryType
  }));
};

export const createCategory = async (name: string, type: CategoryType): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, type }])
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  // Cast the 'type' field from string to CategoryType
  return {
    ...data,
    type: data.type as CategoryType
  };
};

export const updateCategory = async (id: string, name: string, type: CategoryType): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, type })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  
  // Cast the 'type' field from string to CategoryType
  return {
    ...data,
    type: data.type as CategoryType
  };
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

// New function to fetch ESG parameters in a structured format for forms
export const fetchESGParameterStructure = async (): Promise<ESGParameterStructure> => {
  try {
    // Fetch all the required data
    const categories = await fetchCategories();
    const subcategories = await fetchSubcategories();
    const parameters = await fetchParameters();
    
    // Initialize the structure with the three main ESG categories
    const structure: ESGParameterStructure = {
      environmental: {},
      social: {},
      governance: {}
    };
    
    // Group by category type first
    categories.forEach(category => {
      // Ensure the category type exists in our structure
      if (!structure[category.type]) {
        structure[category.type] = {};
      }
      
      // Initialize this category in the structure
      structure[category.type][category.name] = {};
      
      // Find subcategories for this category
      const categorySubs = subcategories.filter(sub => sub.category_id === category.id);
      
      categorySubs.forEach(subcategory => {
        // Add the subcategory with its parameters
        structure[category.type][category.name][subcategory.name] = {
          parameters: parameters.filter(param => 
            param.category_id === category.id && 
            param.subcategory_id === subcategory.id
          )
        };
      });
    });
    
    console.log("ESG Parameter Structure loaded:", 
      Object.keys(structure.environmental).length, "environmental categories,",
      Object.keys(structure.social).length, "social categories,",
      Object.keys(structure.governance).length, "governance categories"
    );
    
    return structure;
  } catch (error) {
    console.error("Error fetching ESG parameter structure:", error);
    throw error;
  }
};

// Utility function to get parameter by name (useful for forms)
export const findParameterByName = (parameters: Parameter[], name: string): Parameter | undefined => {
  return parameters.find(param => param.name.toLowerCase() === name.toLowerCase());
};

// Utility to convert parameter data for submission (mapping form data to parameters)
export const mapFormDataToParameters = (formData: Record<string, any>, parameterStructure: ESGParameterStructure): Record<string, any> => {
  const mappedData: Record<string, any> = {};
  
  // Iterate through the form data and match with parameters
  Object.entries(formData).forEach(([key, value]) => {
    // Find the parameter with matching name across all categories and subcategories
    for (const categoryType in parameterStructure) {
      for (const categoryName in parameterStructure[categoryType]) {
        for (const subcategoryName in parameterStructure[categoryType][categoryName]) {
          const { parameters } = parameterStructure[categoryType][categoryName][subcategoryName];
          const parameter = findParameterByName(parameters, key);
          
          if (parameter) {
            // Store using parameter id for database consistency
            mappedData[parameter.id] = value;
            break;
          }
        }
      }
    }
  });
  
  return mappedData;
};
