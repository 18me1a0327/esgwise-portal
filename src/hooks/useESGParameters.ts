
import { useQuery } from "@tanstack/react-query";
import { fetchESGParameterStructure, ESGParameterStructure } from "@/services/parameterService";
import { toast } from "@/hooks/use-toast";

/**
 * Hook to fetch ESG parameters in a structured hierarchy:
 * - Category types (environmental, social, governance)
 *   - Categories
 *     - Parameters
 */
export function useESGParameters() {
  return useQuery({
    queryKey: ['esg-parameters'],
    queryFn: fetchESGParameterStructure,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Failed to load ESG parameters",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });
}

/**
 * Utility function to check if a parameter structure is loaded and valid
 */
export function isESGStructureLoaded(data: ESGParameterStructure | undefined): boolean {
  if (!data) return false;
  
  // Check if we have the three main category types
  return ['environmental', 'social', 'governance'].every(type => 
    typeof data[type] === 'object' && data[type] !== null
  );
}
