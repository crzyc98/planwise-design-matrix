import React from 'react';
import { FIELD_DEFINITIONS } from '../constants';
import { PlanCategory, PlanData } from '../types';
import { InlineInput } from './InlineInput';
import { Info } from 'lucide-react';

interface PlanMatrixProps {
  planData: PlanData;
  onUpdateField: (field: keyof PlanData, value: any) => void;
}

export const PlanMatrix: React.FC<PlanMatrixProps> = ({ planData, onUpdateField }) => {

  // Group fields by category
  const categories = Object.values(PlanCategory);

  const isFieldDisabled = (fieldId: string): boolean => {
    const def = FIELD_DEFINITIONS.find(f => f.id === fieldId);
    if (!def?.dependencyFieldId) return false;

    const parentValue = planData[def.dependencyFieldId as keyof PlanData];
    
    // Handle array dependency (e.g. vesting schedule can be one of multiple values)
    if (Array.isArray(def.dependencyValue)) {
      return !def.dependencyValue.includes(parentValue);
    }
    
    // Handle simple equality
    return parentValue !== def.dependencyValue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{category}</h3>
            {category === PlanCategory.AUTO_FEATURES && (
              <span className="bg-brand-100 text-brand-800 text-xs px-2 py-0.5 rounded-full font-medium">
                High Impact
              </span>
            )}
          </div>
          <div className="p-5 flex-1 space-y-5">
            {FIELD_DEFINITIONS.filter((f) => f.category === category).map((field) => {
              const disabled = isFieldDisabled(field.id);
              
              return (
                <div key={field.id} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-xs font-medium uppercase tracking-wider ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                      {field.label}
                    </label>
                    {field.tooltip && !disabled && (
                      <div className="group relative cursor-help">
                        <Info size={12} className="text-gray-400 hover:text-brand-500" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {field.tooltip}
                          <div className="absolute bottom-0 right-1 translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <InlineInput
                    type={field.type}
                    value={planData[field.id as keyof PlanData]}
                    options={field.options}
                    disabled={disabled}
                    onSave={(val) => onUpdateField(field.id as keyof PlanData, val)}
                  />
                  
                  {disabled && (
                     <p className="text-[10px] text-gray-400 mt-1 italic">
                       Requires {field.dependencyFieldId} adjustment
                     </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
