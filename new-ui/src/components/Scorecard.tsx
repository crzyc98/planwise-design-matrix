import React, { useState, useRef, useEffect } from 'react';
import { Client } from '../types';
import { CheckCircle2, AlertCircle, Minus, ArrowRight, ShieldCheck, AlertTriangle, Filter, ChevronDown, Check, Map, Briefcase, Building2 } from 'lucide-react';

interface ScorecardProps {
  client: Client;
}

type Status = 'below' | 'at' | 'better';

interface ScoreItem {
  id: string;
  label: string;
  subLabel?: string;
  clientValue: string | number;
  benchmarkValue: string | number;
  status: Status;
  insight: string;
  format?: 'percent' | 'number' | 'years' | 'text';
}

// --- Mock Data for Filters ---
const INDUSTRIES = [
  'Association',
  'Credit Union',
  'Energy',
  'Finance',
  'Healthcare',
  'Higher Education',
  'Insurance',
  'Manufacturing',
  'Professional Services',
  'Public Sector',
  'Religious Organization',
  'Research Institution',
  'Retail',
  'Technology',
  'Union'
];
const REGIONS = ['Northeast', 'Midwest', 'South', 'West Coast', 'Pacific Northwest', 'Mountain West'];
const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'MA', 'WA'];

// --- Reusable Multi-Select Component ---
interface MultiSelectProps {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, icon: Icon, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm font-medium transition-all shadow-sm ${isOpen ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <Icon size={16} className="text-slate-500" />
        <span className="text-slate-700">
          {selected.length === 0 ? `Select ${label}` : `${label} (${selected.length})`}
        </span>
        <ChevronDown size={14} className="text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            {selected.length > 0 && (
              <button 
                onClick={() => onChange([])}
                className="text-xs text-brand-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map(option => {
              const isSelected = selected.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${isSelected ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>{option}</span>
                  {isSelected && <Check size={14} className="text-brand-600" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const Scorecard: React.FC<ScorecardProps> = ({ client }) => {
  
  // --- Benchmark Filter State ---
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([client.industry]);
  const [geoScope, setGeoScope] = useState<'region' | 'state'>('region');
  const [selectedGeo, setSelectedGeo] = useState<string[]>([client.region]);

  // Handle switching scopes (clear selection if switching from Region to State or vice versa)
  const handleScopeChange = (scope: 'region' | 'state') => {
    setGeoScope(scope);
    setSelectedGeo([]); // Reset selection on toggle for clarity
  };

  // Benchmark definition (Mocked - in a real app these would fetch based on state)
  const BENCHMARKS = {
    eligibility: '3 Months',     // Text benchmark
    autoEnrollmentRate: 4.2,     // Median %
    totalOpportunity: 5.5,       // Median Total (Match + Non-Elective)
    autoEscalationCap: 10,       // Median %
    vestingPeriod: 3             // Median Years (Cliff)
  };

  // Helper to rank service requirements for comparison (Lower is better)
  const getServiceRank = (service: string): number => {
    const s = service.toLowerCase();
    if (s.includes('immediate')) return 0;
    if (s.includes('3 month')) return 3;
    if (s.includes('6 month')) return 6;
    if (s.includes('1,000 hours') && !s.includes('1 year')) return 6; // Treat standalone 1000 hours roughly like 6 months
    if (s.includes('1 year')) return 12; // This matches "1 Year" and "1 Year + 1,000 Hours"
    return 99;
  };

  // Helper to determine status
  const getStatus = (val: number, benchmark: number, lowerIsBetter = false): Status => {
    if (val === benchmark) return 'at';
    
    if (lowerIsBetter) {
      return val < benchmark ? 'better' : 'below';
    }
    return val > benchmark ? 'better' : 'below';
  };

  // Calculate Derived Metrics
  const totalEmployerContribution = client.plan.matchCap + client.plan.nonElectiveContribution;

  // Build the score items
  const items: ScoreItem[] = [
    {
      id: 'eligibility',
      label: 'Eligibility & Entry',
      subLabel: 'Service requirement',
      clientValue: client.plan.serviceRequirement,
      benchmarkValue: BENCHMARKS.eligibility,
      status: getStatus(
        getServiceRank(client.plan.serviceRequirement), 
        getServiceRank(BENCHMARKS.eligibility), 
        true // Lower (shorter wait) is better
      ),
      insight: 'Immediate eligibility significantly improves recruitment competitiveness.',
      format: 'text'
    },
    {
      id: 'total_opp',
      label: 'Max Employer Contribution',
      subLabel: 'Match Cap + Non-Elective Core',
      clientValue: totalEmployerContribution,
      benchmarkValue: BENCHMARKS.totalOpportunity,
      status: getStatus(totalEmployerContribution, BENCHMARKS.totalOpportunity),
      insight: 'Total potential value (Match + Core) an employee can receive from the employer.',
      format: 'percent'
    },
    {
      id: 'ae_rate',
      label: 'Auto-Enrollment Default',
      clientValue: client.plan.autoEnrollmentRate,
      benchmarkValue: BENCHMARKS.autoEnrollmentRate,
      status: getStatus(client.plan.autoEnrollmentRate, BENCHMARKS.autoEnrollmentRate),
      insight: 'Higher default rates improve participation outcomes.',
      format: 'percent'
    },
    {
      id: 'esc_cap',
      label: 'Auto-Escalation Cap',
      clientValue: client.plan.autoEscalationCap,
      benchmarkValue: BENCHMARKS.autoEscalationCap,
      status: getStatus(client.plan.autoEscalationCap, BENCHMARKS.autoEscalationCap),
      insight: 'Higher caps allow employees to grow savings automatically over time.',
      format: 'percent'
    },
    {
      id: 'vesting',
      label: 'Vesting Period',
      subLabel: 'Years to full vesting',
      clientValue: client.plan.vestingCliff,
      benchmarkValue: BENCHMARKS.vestingPeriod,
      status: getStatus(client.plan.vestingCliff, BENCHMARKS.vestingPeriod, true), // Lower is better
      insight: 'Shorter vesting schedules are preferred by employees.',
      format: 'years'
    }
  ];

  // Status visual helpers
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'better':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Market Leader'
        };
      case 'at':
        return {
          icon: Minus, 
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'Market Competitive'
        };
      case 'below':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Below Market'
        };
    }
  };

  const formatValue = (val: string | number, format?: string) => {
    if (format === 'percent') return `${val}%`;
    if (format === 'years') return `${val} Years`;
    return val;
  };

  const scoreSummary = items.reduce((acc, item) => {
    acc[item.status]++;
    return acc;
  }, { better: 0, at: 0, below: 0 });

  // Generate dynamic description
  const industryText = selectedIndustries.length > 0 
    ? selectedIndustries.length > 2 
      ? `${selectedIndustries.length} Industries` 
      : selectedIndustries.join(' & ') 
    : 'All Industries';
    
  const geoText = selectedGeo.length > 0
    ? selectedGeo.length > 2
      ? `${selectedGeo.length} ${geoScope === 'region' ? 'Regions' : 'States'}`
      : selectedGeo.join(', ')
    : `All ${geoScope === 'region' ? 'Regions' : 'States'}`;

  // Fake cohort size calculation based on filter complexity
  const cohortSize = Math.max(12, 340 - (selectedIndustries.length * 20) - (selectedGeo.length * 15));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Configuration Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
          <div className="flex items-center gap-2 text-slate-500 min-w-max">
            <Filter size={18} />
            <span className="font-semibold text-sm text-slate-700">Benchmark Group:</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          <div className="flex flex-wrap items-center gap-3">
             {/* Industry Multi-Select */}
             <MultiSelect 
               label="Industry" 
               icon={Briefcase} 
               options={INDUSTRIES} 
               selected={selectedIndustries} 
               onChange={setSelectedIndustries} 
             />

             {/* Geo Scope Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => handleScopeChange('region')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${geoScope === 'region' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Regional
                </button>
                <button 
                  onClick={() => handleScopeChange('state')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${geoScope === 'state' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  State
                </button>
             </div>

             {/* Geo Multi-Select (Dynamic Options) */}
             <MultiSelect 
               label={geoScope === 'region' ? 'Region' : 'State'} 
               icon={geoScope === 'region' ? Map : Building2} 
               options={geoScope === 'region' ? REGIONS : STATES} 
               selected={selectedGeo} 
               onChange={setSelectedGeo} 
             />
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 whitespace-nowrap">
           <span className="text-xs font-bold">N={cohortSize}</span>
           <span className="text-xs opacity-75">Plans in Cohort</span>
        </div>
      </div>

      {/* Header Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-brand-600" />
            PlanAlign Scorecard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Benchmarked against <span className="font-semibold text-slate-700">{industryText}</span> peers in <span className="font-semibold text-slate-700">{geoText}</span>.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl font-bold text-green-700">{scoreSummary.better}</div>
            <div className="text-xs font-medium text-green-800 uppercase tracking-wide">Leading</div>
          </div>
          <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-100">
             <div className="text-2xl font-bold text-yellow-700">{scoreSummary.at}</div>
             <div className="text-xs font-medium text-yellow-800 uppercase tracking-wide">Competitive</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-100">
             <div className="text-2xl font-bold text-red-700">{scoreSummary.below}</div>
             <div className="text-xs font-medium text-red-800 uppercase tracking-wide">Lagging</div>
          </div>
        </div>
      </div>

      {/* Scorecard Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Metric</div>
          <div className="col-span-3 text-center">Comparison</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-3">Insight</div>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const config = getStatusConfig(item.status);
            const Icon = config.icon;

            return (
              <div key={item.id} className="grid grid-cols-12 py-5 px-6 items-center hover:bg-slate-50/50 transition-colors">
                
                {/* Metric Name */}
                <div className="col-span-4 pr-4">
                  <h4 className="font-semibold text-slate-900">{item.label}</h4>
                  {item.subLabel && <p className="text-xs text-slate-500 mt-0.5">{item.subLabel}</p>}
                </div>

                {/* Values Comparison */}
                <div className="col-span-3 flex items-center justify-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Your Plan</div>
                    <div className="font-bold text-slate-900">{formatValue(item.clientValue, item.format)}</div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300" />
                  <div className="text-left">
                     <div className="text-xs text-slate-400 font-medium mb-0.5">Benchmark</div>
                     <div className="font-medium text-slate-600">{formatValue(item.benchmarkValue, item.format)}</div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="col-span-2 flex justify-center">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg} ${config.border} ${config.color}`}>
                    <Icon size={14} strokeWidth={2.5} />
                    <span className="text-xs font-bold whitespace-nowrap">{config.label}</span>
                  </div>
                </div>

                {/* Insight */}
                <div className="col-span-3 pl-4 border-l border-slate-100">
                   <p className="text-sm text-slate-500 leading-snug">
                     {item.insight}
                   </p>
                   {item.status === 'below' && (
                     <div className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 cursor-pointer hover:underline">
                       <AlertTriangle size={12} />
                       View improvement options
                     </div>
                   )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};