
import { useQuery } from "@tanstack/react-query";
import { fetchESGParameterStructure, ESGParameterStructure } from "@/services/parameterService";

export function useESGParameters() {
  return useQuery({
    queryKey: ['esg-parameters'],
    queryFn: fetchESGParameterStructure,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
