
import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/ui/GlassCard";

type CarbonEmissionsData = {
  name: string;
  date: string;
  period: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
};

interface CarbonEmissionsChartProps {
  data: CarbonEmissionsData[];
}

const CarbonEmissionsChart: React.FC<CarbonEmissionsChartProps> = ({ data }) => {
  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A'];
  const [chartType, setChartType] = useState<'stacked' | 'line' | 'area' | 'pie'>('stacked');

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No carbon emissions data available
      </div>
    );
  }

  // Prepare data for pie chart - total emissions by scope
  const pieData = [
    { name: 'Scope 1 (Direct)', value: data.reduce((sum, item) => sum + item.scope1, 0) },
    { name: 'Scope 2 (Indirect)', value: data.reduce((sum, item) => sum + item.scope2, 0) },
    { name: 'Scope 3 (Value Chain)', value: data.reduce((sum, item) => sum + item.scope3, 0) },
  ];

  // Extract periods for x-axis labels
  const timeLabels = data.map(item => item.period);

  return (
    <GlassCard className="p-5" hoverable>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">GHG Emissions by Scope (tCO2e)</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setChartType('stacked')} 
              className={`px-2 py-1 text-xs rounded ${chartType === 'stacked' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Stacked
            </button>
            <button 
              onClick={() => setChartType('line')} 
              className={`px-2 py-1 text-xs rounded ${chartType === 'line' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Line
            </button>
            <button 
              onClick={() => setChartType('area')} 
              className={`px-2 py-1 text-xs rounded ${chartType === 'area' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Area
            </button>
            <button 
              onClick={() => setChartType('pie')} 
              className={`px-2 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Pie
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Scope 1: Direct emissions from owned sources (fuel combustion, company vehicles)</p>
            <p className="text-sm text-gray-600">Scope 2: Indirect emissions from purchased electricity, steam, heating, and cooling</p>
            <p className="text-sm text-gray-600">Scope 3: All other indirect emissions in the value chain (business travel, waste, etc.)</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Emissions</p>
            <p className="text-2xl font-bold">{Math.round(data.reduce((sum, item) => sum + item.total, 0))} tCO2e</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'stacked' && (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} tCO2e`, '']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Bar dataKey="scope1" name="Scope 1 (Direct)" stackId="a" fill="#FF453A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scope2" name="Scope 2 (Indirect)" stackId="a" fill="#FF9F0A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scope3" name="Scope 3 (Value Chain)" stackId="a" fill="#30D158" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {chartType === 'line' && (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} tCO2e`, '']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="scope1" name="Scope 1 (Direct)" stroke="#FF453A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="scope2" name="Scope 2 (Indirect)" stroke="#FF9F0A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="scope3" name="Scope 3 (Value Chain)" stroke="#30D158" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="total" name="Total Emissions" stroke="#0A84FF" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            )}
            {chartType === 'area' && (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} tCO2e`, '']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Area type="monotone" dataKey="scope1" name="Scope 1 (Direct)" stackId="1" stroke="#FF453A" fill="#FF453A" />
                <Area type="monotone" dataKey="scope2" name="Scope 2 (Indirect)" stackId="1" stroke="#FF9F0A" fill="#FF9F0A" />
                <Area type="monotone" dataKey="scope3" name="Scope 3 (Value Chain)" stackId="1" stroke="#30D158" fill="#30D158" />
              </AreaChart>
            )}
            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toLocaleString()} tCO2e`, '']} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};

export default CarbonEmissionsChart;
