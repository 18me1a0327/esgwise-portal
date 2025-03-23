
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "@/components/ui/GlassCard";

export type TimelineData = {
  date: string;
  displayDate: string;
  [key: string]: any;
};

type ChartType = 'bar' | 'line' | 'area';

interface TimelineChartProps {
  title: string;
  data: TimelineData[];
  dataKeys: string[];
  colors: string[];
  chartType?: ChartType;
  subtitle?: string;
  unit?: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ 
  title, 
  data, 
  dataKeys, 
  colors, 
  chartType = 'bar',
  subtitle,
  unit = ""
}) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(chartType);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No data available
      </div>
    );
  }

  // Calculate totals for each metric
  const totals = dataKeys.reduce((acc, key) => {
    acc[key] = data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  // Format the tooltip value based on the unit
  const formatTooltipValue = (value: number) => {
    if (unit) {
      return `${value.toLocaleString()} ${unit}`;
    }
    return value.toLocaleString();
  };

  return (
    <GlassCard className="p-5" hoverable>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedChartType('bar')} 
              className={`px-2 py-1 text-xs rounded ${selectedChartType === 'bar' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Bar
            </button>
            <button 
              onClick={() => setSelectedChartType('line')} 
              className={`px-2 py-1 text-xs rounded ${selectedChartType === 'line' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Line
            </button>
            <button 
              onClick={() => setSelectedChartType('area')} 
              className={`px-2 py-1 text-xs rounded ${selectedChartType === 'area' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Area
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dataKeys.map((key, index) => (
            <div key={key} className="bg-gray-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500">{key}</p>
              <p className="text-sm font-medium" style={{ color: colors[index % colors.length] }}>
                {totals[key].toLocaleString()} {unit}
              </p>
            </div>
          ))}
        </div>

        <div className="h-[300px]">
          {selectedChartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayDate" 
                />
                <YAxis />
                <Tooltip formatter={(value) => [formatTooltipValue(Number(value)), '']} />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={colors[index % colors.length]} 
                    radius={[4, 4, 0, 0]} 
                    isAnimationActive={false}
                    label={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
          {selectedChartType === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayDate" 
                />
                <YAxis />
                <Tooltip formatter={(value) => [formatTooltipValue(Number(value)), '']} />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    isAnimationActive={false}
                    label={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          {selectedChartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayDate" 
                />
                <YAxis />
                <Tooltip formatter={(value) => [formatTooltipValue(Number(value)), '']} />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Area 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    fill={colors[index % colors.length]} 
                    stroke={colors[index % colors.length]} 
                    fillOpacity={0.6} 
                    isAnimationActive={false}
                    label={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default TimelineChart;
