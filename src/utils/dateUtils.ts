
/**
 * Calculates date range based on timeframe
 * @param timeframe quarter, year, or custom
 * @returns Object with startDate and endDate
 */
export const calculateDateRange = (timeframe: string = "quarter"): { startDate: Date, endDate: Date } => {
  const endDate = new Date();
  let startDate = new Date();
  
  if (timeframe === "quarter") {
    startDate.setMonth(endDate.getMonth() - 3);
  } else if (timeframe === "year") {
    startDate.setFullYear(endDate.getFullYear() - 1);
  } else if (timeframe === "custom") {
    // For now, default to 6 months for custom
    startDate.setMonth(endDate.getMonth() - 6);
  }
  
  return { startDate, endDate };
};

/**
 * Creates a display date format (e.g., "Jan'23")
 * @param dateString ISO date string
 * @returns Formatted display date
 */
export const formatDisplayDate = (dateString: string): string => {
  const dateObj = new Date(dateString);
  const monthAbbr = dateObj.toLocaleString('default', { month: 'short' });
  const yearShort = dateObj.getFullYear().toString().slice(2);
  return `${monthAbbr}'${yearShort}`;
};
