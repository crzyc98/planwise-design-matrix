import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { Client, PlanData } from '../types';
import { Target, TrendingUp, Users, DollarSign, Zap, ArrowUp, Minus, ArrowDown, Lightbulb, BookOpen, ChevronRight } from 'lucide-react';

interface AssessmentProps {
  client: Client;
}

// Optimization Factors
type Factor = 'Recruitment' | 'Retention' | 'CostROI' | 'Outcomes' | 'Efficiency';

export const Assessment: React.FC<AssessmentProps> = ({ client }) => {
  const { plan } = client;

  // Guard against missing plan data
  if (!plan || Object.keys(plan).length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-slate-500">Plan data is not available for assessment.</p>
      </div>
    );
  }

  // --- Scoring Logic (Heuristic) ---
  const calculateScores = (p: PlanData) => {
    let scores = {
      Recruitment: 2,
      Retention: 2,
      CostROI: 2,
      Outcomes: 1,
      Efficiency: 3
    };

    // Recruitment: Immediate eligibility and strong match attract talent
    if (p.serviceRequirement === 'Immediate') scores.Recruitment += 1;
    if (p.matchCap >= 4) scores.Recruitment += 1;
    if (p.autoEnrollment) scores.Recruitment += 0.5;
    if (p.entryDate === 'Immediate') scores.Recruitment += 0.5;

    // Retention: Vesting and Auto-Escalation keep people
    if (p.vestingSchedule === 'Graded') scores.Retention += 1; // "Golden handcuffs"
    if (p.vestingCliff >= 3) scores.Retention += 1;
    if (p.autoEscalation) scores.Retention += 1;
    // Safe access for employerMatch
    if (p.employerMatch?.includes('stretch') || p.matchCap >= 5) scores.Retention += 1;

    // Outcomes: Auto-features are the north star
    if (p.autoEnrollment) scores.Outcomes += 1;
    if (p.autoEnrollmentRate >= 4) scores.Outcomes += 1;
    if (p.autoEscalation) scores.Outcomes += 1;
    if (p.autoEscalationCap >= 10) scores.Outcomes += 1;

    // Cost/ROI: Bang for the buck. 
    // High match is expensive, but we measure ROI here. 
    // Auto-features + match = High ROI on talent.
    if (p.autoEnrollment && p.matchCap > 0) scores.CostROI += 1;
    if (p.vestingSchedule === 'Cliff') scores.CostROI += 1; // Forfeiture savings
    if (p.serviceRequirement !== 'Immediate') scores.CostROI += 1; // Delay cost

    // Efficiency: Simple rules
    if (p.autoEnrollment) scores.Efficiency += 1; // Reduces manual follow up
    if (p.serviceRequirement === 'Immediate') scores.Efficiency += 1; // Less tracking
    if (p.vestingSchedule === 'Immediate') scores.Efficiency += 1; // No forfeiture tracking

    // Cap at 5
    Object.keys(scores).forEach(k => {
      scores[k as Factor] = Math.min(5, Math.max(1, scores[k as Factor]));
    });

    return scores;
  };

  const scores = calculateScores(plan);

  const radarData = [
    { subject: 'Recruitment', A: scores.Recruitment, fullMark: 5 },
    { subject: 'Retention', A: scores.Retention, fullMark: 5 },
    { subject: 'Cost/ROI', A: scores.CostROI, fullMark: 5 },
    { subject: 'Outcomes', A: scores.Outcomes, fullMark: 5 },
    { subject: 'Efficiency', A: scores.Efficiency, fullMark: 5 },
  ];

  // --- Dynamic Executive Summary ---
  const getExecutiveSummary = () => {
    const weaknesses = [];
    if (scores.Outcomes < 3) weaknesses.push("retirement readiness");
    if (scores.Recruitment < 3) weaknesses.push("talent acquisition competitiveness");
    if (scores.Retention < 3) weaknesses.push("employee retention");

    if (weaknesses.length === 0) return "Your plan is currently well-balanced across all strategic objectives. Focus on maintaining this momentum with regular reviews.";

    return `Your plan design shows opportunities to improve ${weaknesses.join(' and ')}. Aligning levers like Auto-Enrollment and Vesting can drive these metrics without necessarily increasing budget significantly.`;
  };

  // --- Strategic Levers Config ---
  const levers = [
    {
      category: "Eligibility & Entry",
      current: `${plan.serviceRequirement} / ${plan.entryDate}`,
      status: plan.serviceRequirement === 'Immediate' ? 'positive' : 'neutral',
      impacts: {
        Recruitment: plan.serviceRequirement === 'Immediate' ? 'up_strong' : 'down',
        Retention: 'neutral',
        CostROI: plan.serviceRequirement === 'Immediate' ? 'neutral' : 'up', // Delay saves money
        Outcomes: plan.serviceRequirement === 'Immediate' ? 'up' : 'neutral',
        Efficiency: plan.serviceRequirement === 'Immediate' ? 'up' : 'neutral'
      },
      insight: plan.serviceRequirement === 'Immediate'
        ? "Immediate entry maximizes recruitment appeal and accelerates participant savings momentum."
        : "Waiting periods control costs during high-turnover windows but reduce perceived value for new hires."
    },
    {
      category: "Auto-Enrollment & Escalation",
      current: plan.autoEnrollment
        ? `Active at ${plan.autoEnrollmentRate}%${plan.autoEscalation ? ` + Escalate to ${plan.autoEscalationCap}%` : ''}`
        : "Not Active",
      status: plan.autoEnrollment && plan.autoEscalation ? 'positive' : 'negative',
      impacts: {
        Recruitment: 'up',
        Retention: 'up',
        CostROI: 'neutral',
        Outcomes: 'up_strong',
        Efficiency: 'up'
      },
      insight: plan.autoEnrollment
        ? "Strongest driver of broad-based participation and savings momentum."
        : "Missed opportunity. Auto-enrollment is the single most effective lever for closing the preparedness gap."
    },
    {
      category: "Employer Match",
      current: `${plan.employerMatch}`,
      status: plan.matchCap >= 3 ? 'positive' : 'neutral',
      impacts: {
        Recruitment: 'up_strong',
        Retention: 'up',
        CostROI: 'up',
        Outcomes: 'up',
        Efficiency: 'neutral'
      },
      insight: "A competitive match is a primary driver for talent acquisition and reinforces 'skin in the game'."
    },
    {
      category: "Vesting Schedule",
      current: `${plan.vestingSchedule} (${plan.vestingCliff > 0 ? plan.vestingCliff + ' Yr' : 'Immediate'})`,
      status: plan.vestingSchedule === 'Graded' ? 'positive' : 'neutral',
      impacts: {
        Recruitment: 'neutral',
        Retention: 'up_strong',
        CostROI: 'up',
        Outcomes: 'neutral',
        Efficiency: 'neutral'
      },
      insight: plan.vestingSchedule === 'Graded'
        ? "Graded vesting supports retention by creating a continuous cost of exit for employees."
        : "Cliff vesting maximizes forfeiture savings but creates 'cliffs' in retention behavior."
    }
  ];

  const renderImpactIcon = (type: string) => {
    switch (type) {
      case 'up_strong': return <span className="flex items-center text-green-700 font-bold text-xs">▲▲</span>;
      case 'up': return <span className="flex items-center text-green-600 text-xs">▲</span>;
      case 'down': return <span className="flex items-center text-red-500 text-xs">▼</span>;
      default: return <span className="flex items-center text-slate-300 text-xs">▬</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Executive Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/50">
                <Target className="text-brand-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Strategic Assessment</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg mb-6">
              {getExecutiveSummary()}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <Users size={14} className="text-brand-300" />
                <span>Impact on Recruitment</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <TrendingUp size={14} className="text-brand-300" />
                <span>Retention Signal</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <DollarSign size={14} className="text-brand-300" />
                <span>Cost Efficiency</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="w-full md:w-80 h-64 bg-white/5 rounded-xl border border-white/10 p-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="Plan Score"
                  dataKey="A"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="#22c55e"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#22c55e' }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="absolute top-2 right-2 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
              Scale: 1-5
            </div>
          </div>
        </div>
      </div>

      {/* Lever Analysis - Full Width */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            Lever Library Analysis
          </h3>
          <span className="text-sm text-slate-500">Based on PlanAlign Methodology</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Strategic Lever</div>
            <div className="col-span-1 text-center" title="Recruitment">Rec</div>
            <div className="col-span-1 text-center" title="Retention">Ret</div>
            <div className="col-span-1 text-center" title="Cost/ROI">ROI</div>
            <div className="col-span-1 text-center" title="Outcomes">Out</div>
            <div className="col-span-1 text-center" title="Efficiency">Eff</div>
            <div className="col-span-4 text-left pl-6">Strategic Insight</div>
          </div>

          {levers.map((lever, idx) => (
            <div key={idx} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
              <div className="col-span-3 pr-4">
                <p className="font-semibold text-slate-900 text-sm">{lever.category}</p>
                <p className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full inline-block ${lever.status === 'positive' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {lever.current}
                </p>
              </div>
              <div className="col-span-1 flex justify-center">{renderImpactIcon(lever.impacts.Recruitment)}</div>
              <div className="col-span-1 flex justify-center">{renderImpactIcon(lever.impacts.Retention)}</div>
              <div className="col-span-1 flex justify-center">{renderImpactIcon(lever.impacts.CostROI)}</div>
              <div className="col-span-1 flex justify-center">{renderImpactIcon(lever.impacts.Outcomes)}</div>
              <div className="col-span-1 flex justify-center">{renderImpactIcon(lever.impacts.Efficiency)}</div>
              <div className="col-span-4 pl-6 border-l border-slate-100">
                <p className="text-xs text-slate-500 leading-snug">{lever.insight}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Matrix Text */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-600" />
            Impact Matrix Guide
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="block font-bold text-slate-900 mb-1">Recruitment</span>
              Attracts candidates via clear value, early eligibility, and meaningful defaults.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="block font-bold text-slate-900 mb-1">Retention</span>
              Reduces regrettable attrition via vesting cadence and growing balances.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="block font-bold text-slate-900 mb-1">Cost/ROI</span>
              Net employer spend vs return (talent outcomes, reduced waste).
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <span className="block font-bold text-slate-900 mb-1">Outcomes</span>
              Closes the Preparedness Gap and improves replacement rates.
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Section - Moved to Bottom & Grid Layout */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="text-brand-600" />
          <h3 className="text-xl font-bold text-slate-900">Recommended Optimization Recipes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dynamic Recommendation Card 1 */}
          {!plan.autoEnrollment && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 border-t-4 border-t-brand-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
              <h4 className="font-bold text-slate-900 text-base mb-2">🚀 Recruitment-Forward Default</h4>
              <p className="text-sm text-slate-500 mb-4 flex-grow">
                Your current design lacks Auto-Enrollment, missing a key recruitment signal.
              </p>
              <div className="text-xs bg-slate-50 p-3 rounded text-slate-700 space-y-2 border border-slate-100 mb-4">
                <div className="flex justify-between"><span>Auto-Enroll:</span> <strong>6%</strong></div>
                <div className="flex justify-between"><span>Auto-Escalate:</span> <strong>+1% to 10%</strong></div>
                <div className="flex justify-between"><span>Vesting:</span> <strong>Graded</strong></div>
              </div>
              <div className="text-brand-600 text-sm font-bold flex items-center justify-end gap-1 group-hover:gap-2 transition-all">
                Apply to Navigator <ChevronRight size={16} />
              </div>
            </div>
          )}

          {/* Dynamic Recommendation Card 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 border-t-4 border-t-blue-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
            <h4 className="font-bold text-slate-900 text-base mb-2">🛡️ Retention-Focused Tune</h4>
            <p className="text-sm text-slate-500 mb-4 flex-grow">
              Optimize for 2-3 year retention targets typical in {client.industry}.
            </p>
            <div className="text-xs bg-slate-50 p-3 rounded text-slate-700 space-y-2 border border-slate-100 mb-4">
              <div className="flex justify-between"><span>Match:</span> <strong>Stretch (50% to 6%)</strong></div>
              <div className="flex justify-between"><span>Vesting:</span> <strong>3-6 Yr Graded</strong></div>
              <div className="flex justify-between"><span>True-Up:</span> <strong>Active</strong></div>
            </div>
            <div className="text-blue-600 text-sm font-bold flex items-center justify-end gap-1 group-hover:gap-2 transition-all">
              Apply to Navigator <ChevronRight size={16} />
            </div>
          </div>

          {/* Cost Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 border-t-4 border-t-slate-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
            <h4 className="font-bold text-slate-900 text-base mb-2">💰 Cost-Conscious Control</h4>
            <p className="text-sm text-slate-500 mb-4 flex-grow">
              Maximize perceived value while managing budget volatility.
            </p>
            <div className="text-xs bg-slate-50 p-3 rounded text-slate-700 space-y-2 border border-slate-100 mb-4">
              <div className="flex justify-between"><span>Match:</span> <strong>LDW Applied</strong></div>
              <div className="flex justify-between"><span>Core:</span> <strong>None</strong></div>
              <div className="flex justify-between"><span>Wait Period:</span> <strong>1 Year</strong></div>
            </div>
            <div className="text-slate-600 text-sm font-bold flex items-center justify-end gap-1 group-hover:gap-2 transition-all">
              Apply to Navigator <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};