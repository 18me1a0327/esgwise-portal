
import { useQuery } from '@tanstack/react-query';
import { fetchESGParameterStructure, ESGParameterStructure } from '@/services/parameterService';

export const useESGParameters = () => {
  return useQuery({
    queryKey: ['esg-parameters'],
    queryFn: fetchESGParameterStructure,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
};

// Helper function to check if the ESG structure is loaded
export const isESGStructureLoaded = (structure: ESGParameterStructure | undefined): boolean => {
  if (!structure) return false;
  
  // Count total parameters across all categories
  let totalParameters = 0;
  ['environmental', 'social', 'governance'].forEach(type => {
    const categoryType = type as keyof ESGParameterStructure;
    if (structure[categoryType]) {
      Object.keys(structure[categoryType]).forEach(categoryName => {
        if (structure[categoryType][categoryName]?.parameters) {
          totalParameters += structure[categoryType][categoryName].parameters.length;
        }
      });
    }
  });
  
  console.log("Total parameters in structure:", totalParameters);
  
  // Structure is considered loaded if it has at least some parameters
  return totalParameters > 0;
};
