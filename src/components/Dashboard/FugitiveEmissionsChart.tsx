
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface FugitiveEmissionsData {
  r22: number;
  r32: number;
  r410: number;
  r134a: number;
  r514a: number;
  co2Refilled: number;
  total: number;
}

interface FugitiveEmissionsChartProps {
  data: FugitiveEmissionsData;
}

const FugitiveEmissionsChart: React.FC<FugitiveEmissionsChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  const COLORS = ['#FF9F0A', '#30D158', '#0A84FF', '#FF453A', '#BF5AF2', '#5E5CE6'];

  // Format data for bar chart
  const barData = [
    { name: 'R22', value: data.r22 },
    { name: 'R32', value: data.r32 },
    { name: 'R410', value: data.r410 },
    { name: 'R134A', value: data.r134a },
    { name: 'R514A', value: data.r514a },
    { name: 'CO2 Refilled', value: data.co2Refilled }
  ];

  // Format data for pie chart
  const pieData = barData.filter(item => item.value > 0);

  // Calculate GWP (Global Warming Potential) for each refrigerant
  const gwpValues = {
    R22: 1810,
    R32: 675,
    R410: 2088,
    R134A: 1430,
    R514A: 2,
    'CO2 Refilled': 1
  };

  const gwpData = barData.map(item => ({
    name: item.name,
    value: item.value,
    gwpValue: (item.value * gwpValues[item.name as keyof typeof gwpValues]) / 1000 // Convert to tCO2e
  }));

  const totalGwp = gwpData.reduce((sum, item) => sum + item.gwpValue, 0);

  return (
    <GlassCard className="p-4 md:p-5" hoverable>
      <div className="flex flex-col space-y-3 md:space-y-4">
        <h3 className="text-base font-medium">Fugitive Emissions</h3>
        
        <div className="bg-gray-50 p-2 md:p-3 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <p className="text-sm text-gray-500">Total Refrigerants</p>
            <p className="text-xl md:text-2xl font-bold">{data.total.toFixed(1)} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Emissions Impact</p>
            <p className="text-lg md:text-xl font-semibold text-amber-600">{totalGwp.toFixed(1)} tCO2e</p>
          </div>
        </div>

        <div className="h-[200px] md:h-[250px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={!isMobile ? {} : {fontSize: 10}} />
              <YAxis tick={!isMobile ? {} : {fontSize: 10}} />
              <Tooltip 
                formatter={(value) => [`${value} kg`, 'Amount']}
                labelFormatter={(label) => `${label} Refrigerant`}
              />
              <Legend wrapperStyle={isMobile ? {fontSize: '10px'} : undefined} />
              <Bar dataKey="value" name="Amount (kg)" fill="#0A84FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col md:flex-row justify-between mt-2 md:mt-4 gap-4">
          <div className="w-full md:w-1/2">
            <h4 className="text-sm font-medium mb-2 text-center">Refrigerant Distribution</h4>
            <div className="h-[150px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 20 : 30}
                      outerRadius={isMobile ? 45 : 60}
                      fill="#8884d8"
                      paddingAngle={3}
                      dataKey="value"
                      label={!isMobile ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : undefined}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg`, '']} />
                    <Legend wrapperStyle={isMobile ? {fontSize: '10px'} : undefined} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No fugitive emissions data
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <h4 className="text-sm font-medium mb-2 text-center">GWP Impact (tCO2e)</h4>
            <div className="grid grid-cols-2 gap-2">
              {gwpData.map((item, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-center">
                  <p className="text-xs text-gray-500">{item.name}</p>
                  <p className="text-sm font-medium">{item.gwpValue.toFixed(1)} tCO2e</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default FugitiveEmissionsChart;
