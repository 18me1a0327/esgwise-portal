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

export interface Parameter {
  id: string;
  name: string;
  unit: string | null;
  category_id: string;
  subcategory_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ESGParameterStructure {
  [categoryType: string]: {
    [categoryName: string]: {
      categoryId: string;
      parameters: Parameter[];
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

// Parameter functions
export const fetchParameters = async (): Promise<Parameter[]> => {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchParametersByCategory = async (categoryId: string): Promise<Parameter[]> => {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const createParameter = async (
  name: string, 
  unit: string | null, 
  categoryId: string
): Promise<Parameter> => {
  const { data, error } = await supabase
    .from('parameters')
    .insert([{ 
      name, 
      unit, 
      category_id: categoryId,
      subcategory_id: null // Now we can explicitly set it to null
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
  categoryId: string
): Promise<Parameter> => {
  const { data, error } = await supabase
    .from('parameters')
    .update({ 
      name, 
      unit, 
      category_id: categoryId,
      subcategory_id: null // Now we can explicitly set it to null
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

// Function to fetch ESG parameters in a structured format for forms
export const fetchESGParameterStructure = async (): Promise<ESGParameterStructure> => {
  try {
    // Fetch all the required data
    const categories = await fetchCategories();
    const parameters = await fetchParameters();
    
    console.log("Fetched categories:", categories.length);
    console.log("Fetched parameters:", parameters.length);
    
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
      
      // Get parameters for this category
      const categoryParameters = parameters.filter(param => param.category_id === category.id);
      console.log(`Category ${category.name} (${category.id}) has ${categoryParameters.length} parameters`);
      
      // Initialize this category in the structure
      structure[category.type][category.name] = {
        categoryId: category.id, // Store the category ID
        parameters: categoryParameters
      };
    });
    
    console.log("ESG Parameter Structure loaded:", 
      Object.keys(structure.environmental).length, "environmental categories,",
      Object.keys(structure.social).length, "social categories,",
      Object.keys(structure.governance).length, "governance categories"
    );
    
    // Log entire structure for debugging
    console.log("Full ESG structure:", JSON.stringify(structure, null, 2));
    
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
    // Find the parameter with matching name across all categories
    for (const categoryType in parameterStructure) {
      for (const categoryName in parameterStructure[categoryType]) {
        const { parameters } = parameterStructure[categoryType][categoryName];
        const parameter = findParameterByName(parameters, key);
        
        if (parameter) {
          // Store using parameter id for database consistency
          mappedData[parameter.id] = value;
          break;
        }
      }
    }
  });
  
  return mappedData;
};
