import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Client } from '../types';

interface RegionalBenchmarkProps {
  client: Client;
}

export const RegionalBenchmark: React.FC<RegionalBenchmarkProps> = ({ client }) => {
  
  // Generating dynamic benchmark data relative to the client to simulate "Real" analysis
  const data = [
    {
      name: 'Auto-Enroll Rate',
      client: client.plan.autoEnrollmentRate,
      regionMedian: 4.2, // Mock median for region
      topQuartile: 6.0,
      unit: '%'
    },
    {
      name: 'Match Cap',
      client: client.plan.matchCap,
      regionMedian: 3.5,
      topQuartile: 5.0,
      unit: '%'
    },
    {
      name: 'Escalation Cap',
      client: client.plan.autoEscalationCap,
      regionMedian: 10,
      topQuartile: 15,
      unit: '%'
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
              <span className="text-gray-600">{p.name}:</span>
              <span className="font-medium text-slate-900">{p.value}{p.payload.unit}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Regional Competitiveness Analysis</h2>
            <p className="text-slate-500 text-sm mt-1">
              Comparing <span className="font-semibold text-brand-600">{client.name}</span> against {client.industry} peers in the {client.region}.
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
            Cohort Size: 142 Plans
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <ReferenceLine y={0} stroke="#000" />
              <Bar 
                dataKey="client" 
                name={client.name} 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
              <Bar 
                dataKey="regionMedian" 
                name="Regional Median" 
                fill="#94a3b8" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
              <Bar 
                dataKey="topQuartile" 
                name="Top Quartile" 
                fill="#cbd5e1" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((metric) => {
          const diff = metric.client - metric.regionMedian;
          const isPositive = diff >= 0;
          
          return (
            <div key={metric.name} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">{metric.name}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{metric.client}{metric.unit}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isPositive ? '+' : ''}{diff.toFixed(1)}{metric.unit} vs Median
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Top performing peers average <span className="font-medium text-slate-600">{metric.topQuartile}{metric.unit}</span>.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
