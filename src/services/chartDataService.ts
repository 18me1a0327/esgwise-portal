
import { formatDisplayDate } from "@/utils/dateUtils";

/**
 * Processes environmental data into chart-ready formats
 * @param environmentalData Array of environmental data records
 * @param submissions Array of submissions
 * @returns Object containing different chart datasets
 */
export const processChartData = (environmentalData: any[], submissions: any[]) => {
  const energyData: any[] = [];
  const emissionsData: any[] = [];
  const waterData: any[] = [];
  const wasteData: any[] = [];
  const carbonEmissionsData: any[] = [];
  
  // Sort submissions by period_start
  const sortedSubmissions = [...submissions].sort((a, b) => 
    new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
  );
  
  // Process each submission to create chart data points
  sortedSubmissions.forEach(submission => {
    // Find matching environmental data
    const envData = environmentalData.find(data => data.submission_id === submission.id);
    
    if (!envData) return;
    
    // Create date label
    const displayDate = formatDisplayDate(submission.period_start);
    
    // Energy data
    energyData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Total': Number(envData.total_electricity) || 0,
      'Grid': (Number(envData.total_electricity) || 0) - ((Number(envData.renewable_ppa) || 0) + (Number(envData.renewable_rooftop) || 0)),
      'Renewable PPA': Number(envData.renewable_ppa) || 0,
      'Renewable Rooftop': Number(envData.renewable_rooftop) || 0
    });
    
    // Emissions data
    emissionsData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'NOx': Number(envData.nox) || 0,
      'SOx': Number(envData.sox) || 0,
      'PM': Number(envData.pm) || 0,
      'Others': (Number(envData.voc) || 0) + (Number(envData.hap) || 0) + (Number(envData.pop) || 0)
    });
    
    // Water data
    waterData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Withdrawal': Number(envData.water_withdrawal) || 0,
      'ThirdParty': Number(envData.third_party_water) || 0,
      'Rainwater': Number(envData.rainwater) || 0,
      'Recycled': Number(envData.recycled_wastewater) || 0,
      'Discharged': Number(envData.water_discharged) || 0
    });
    
    // Waste data
    wasteData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Hazardous': Number(envData.total_hazardous) || 0,
      'NonHazardous': Number(envData.non_hazardous) || 0,
      'Plastic': Number(envData.plastic_waste) || 0,
      'EWaste': Number(envData.e_waste) || 0,
      'BioMedical': Number(envData.bio_medical) || 0,
      'WasteOil': Number(envData.waste_oil) || 0
    });
    
    // Carbon emissions data
    carbonEmissionsData.push({
      name: submission.sites?.name || 'Unknown',
      date: submission.period_start,
      displayDate,
      period: `${new Date(submission.period_start).toLocaleDateString()} - ${new Date(submission.period_end).toLocaleDateString()}`,
      'Electricity': Number(envData.electricity_emissions) || 0,
      'Coal': Number(envData.coal_emissions) || 0,
      'HSD': Number(envData.hsd_emissions) || 0,
      'Furnace Oil': Number(envData.furnace_oil_emissions) || 0,
      'Petrol': Number(envData.petrol_emissions) || 0
    });
  });
  
  return {
    energyData,
    emissionsData,
    waterData,
    wasteData,
    carbonEmissionsData
  };
};
