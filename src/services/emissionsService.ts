
/**
 * Processes environmental data to calculate fugitive emissions
 * @param environmentalData Array of environmental data records
 * @returns Object with processed fugitive emissions data
 */
export const processFugitiveEmissions = (environmentalData: any[]) => {
  console.log("Processing fugitive emissions data from:", environmentalData);
  
  const fugitiveEmissionsData = {
    r22: 0,
    r32: 0,
    r410: 0,
    r134a: 0,
    r514a: 0,
    co2Refilled: 0,
    total: 0
  };
  
  environmentalData.forEach(item => {
    fugitiveEmissionsData.r22 += Number(item.r22_refrigerant || 0);
    fugitiveEmissionsData.r32 += Number(item.r32_refrigerant || 0);
    fugitiveEmissionsData.r410 += Number(item.r410_refrigerant || 0);
    fugitiveEmissionsData.r134a += Number(item.r134a_refrigerant || 0);
    fugitiveEmissionsData.r514a += Number(item.r514a_refrigerant || 0);
    fugitiveEmissionsData.co2Refilled += Number(item.co2_refilled || 0);
  });
  
  // Calculate total
  fugitiveEmissionsData.total = 
    fugitiveEmissionsData.r22 + 
    fugitiveEmissionsData.r32 + 
    fugitiveEmissionsData.r410 + 
    fugitiveEmissionsData.r134a + 
    fugitiveEmissionsData.r514a + 
    fugitiveEmissionsData.co2Refilled;
  
  console.log("Processed fugitive emissions data:", fugitiveEmissionsData);
  
  return fugitiveEmissionsData;
};

/**
 * Calculates renewable energy percentage
 * @param environmentalData Array of environmental data records
 * @returns Percentage of renewable energy
 */
export const calculateRenewablePercentage = (environmentalData: any[]): number => {
  const totalElectricity = environmentalData.reduce((sum, item) => sum + (Number(item.total_electricity) || 0), 0);
  const renewablePPA = environmentalData.reduce((sum, item) => sum + (Number(item.renewable_ppa) || 0), 0);
  const renewableRooftop = environmentalData.reduce((sum, item) => sum + (Number(item.renewable_rooftop) || 0), 0);
  
  return totalElectricity > 0 
    ? ((renewablePPA + renewableRooftop) / totalElectricity) * 100 
    : 0;
};
