
import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/ui/GlassCard";

type EnergyData = {
  name: string;
  date: string;
  period: string;
  totalElectricity: number;
  renewableEnergy: number;
  coal: number;
  fossilFuels: number;
};

interface TimelineEnergyChartProps {
  data: EnergyData[];
}

const TimelineEnergyChart: React.FC<TimelineEnergyChartProps> = ({ data }) => {
  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A'];
  const [metric, setMetric] = useState<'consumption' | 'renewable'>('consumption');

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No energy consumption data available
      </div>
    );
  }

  // Calculate renewable percentage for each period
  const renewableData = data.map(item => ({
    ...item,
    renewablePercentage: item.totalElectricity > 0 
      ? (item.renewableEnergy / item.totalElectricity) * 100 
      : 0
  }));

  // Calculate total renewable percentage
  const totalElectricity = data.reduce((sum, item) => sum + item.totalElectricity, 0);
  const totalRenewable = data.reduce((sum, item) => sum + item.renewableEnergy, 0);
  const overallRenewablePercentage = totalElectricity > 0 
    ? (totalRenewable / totalElectricity) * 100 
    : 0;

  // Prepare pie data for energy source breakdown
  const pieData = [
    { name: 'Renewable', value: totalRenewable },
    { name: 'Coal', value: data.reduce((sum, item) => sum + item.coal, 0) },
    { name: 'Fossil Fuels', value: data.reduce((sum, item) => sum + item.fossilFuels, 0) },
    { name: 'Non-Renewable Electricity', value: totalElectricity - totalRenewable },
  ];

  return (
    <GlassCard className="p-5" hoverable>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">Energy Consumption Over Time</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setMetric('consumption')} 
              className={`px-2 py-1 text-xs rounded ${metric === 'consumption' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Consumption
            </button>
            <button 
              onClick={() => setMetric('renewable')} 
              className={`px-2 py-1 text-xs rounded ${metric === 'renewable' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
            >
              Renewable %
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Renewable Electricity</p>
            <p className="text-2xl font-bold text-green-600">{overallRenewablePercentage.toFixed(1)}%</p>
          </div>
          <div className="flex space-x-8">
            <div>
              <p className="text-sm text-gray-500">Total Consumption</p>
              <p className="text-xl font-semibold">{(totalElectricity + data.reduce((sum, item) => sum + item.coal + item.fossilFuels, 0)).toLocaleString()} kWh</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Renewable Energy</p>
              <p className="text-xl font-semibold text-green-600">{totalRenewable.toLocaleString()} kWh</p>
            </div>
          </div>
        </div>

        <div className="h-[300px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'consumption' ? (
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" orientation="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#0A84FF" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalElectricity" name="Total Electricity" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="renewableEnergy" name="Renewable Energy" fill="#30D158" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="coal" name="Coal" fill="#FF9F0A" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="fossilFuels" name="Fossil Fuels" fill="#FF453A" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="renewableEnergy" name="Renewable Trend" stroke="#22C55E" strokeWidth={2} dot={{ stroke: '#22C55E', strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            ) : (
              <ComposedChart data={renewableData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value, name) => name === 'renewablePercentage' ? [`${value.toFixed(1)}%`, 'Renewable %'] : [`${value.toLocaleString()} kWh`, name]} />
                <Legend />
                <Bar dataKey="totalElectricity" name="Total Electricity" fill="#0A84FF" radius={[4, 4, 0, 0]} fillOpacity={0.3} />
                <Line type="monotone" dataKey="renewablePercentage" name="Renewable %" stroke="#22C55E" strokeWidth={3} dot={{ stroke: '#22C55E', strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-4">
          <div className="w-1/2">
            <h4 className="text-sm font-medium mb-2 text-center">Energy Source Breakdown</h4>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} kWh`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="w-1/2 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Total Electricity</p>
                <p className="text-sm font-medium">{totalElectricity.toLocaleString()} kWh</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Renewable Energy</p>
                <p className="text-sm font-medium">{totalRenewable.toLocaleString()} kWh</p>
              </div>
              <div className="bg-amber-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Coal Consumption</p>
                <p className="text-sm font-medium">{data.reduce((sum, item) => sum + item.coal, 0).toLocaleString()} MT</p>
              </div>
              <div className="bg-red-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Fossil Fuels</p>
                <p className="text-sm font-medium">{data.reduce((sum, item) => sum + item.fossilFuels, 0).toLocaleString()} KL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TimelineEnergyChart;
