import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface InlineInputProps {
  value: any;
  type: 'text' | 'number' | 'percent' | 'boolean' | 'select';
  options?: string[];
  disabled?: boolean;
  onSave: (newValue: any) => void;
  className?: string;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  value,
  type,
  options,
  disabled,
  onSave,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    setTempValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    let finalValue = tempValue;
    if (type === 'number' || type === 'percent') {
      finalValue = Number(tempValue);
    }
    onSave(finalValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  // Render Boolean (Toggle/Select equivalent)
  if (type === 'boolean') {
    return (
      <div className={`relative inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <button
          disabled={disabled}
          onClick={() => !disabled && onSave(!value)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${value ? 'bg-brand-600' : 'bg-slate-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow
              ${value ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <span className="ml-3 text-sm font-medium text-slate-700">
          {value ? 'Yes' : 'No'}
        </span>
      </div>
    );
  }

  // Display Mode
  if (!isEditing) {
    let displayValue = value;
    if (type === 'percent') displayValue = `${value}%`;
    if (value === undefined || value === null || value === '') displayValue = '-';

    return (
      <div
        onClick={() => !disabled && setIsEditing(true)}
        className={`
          group relative py-1.5 px-3 -ml-3 rounded-lg border border-transparent 
          transition-all duration-200
          ${disabled
            ? 'cursor-not-allowed text-slate-400 opacity-60'
            : 'hover:bg-white hover:shadow-sm hover:border-brand-200 cursor-text text-slate-900 hover:text-brand-700'
          }
          ${className}
        `}
      >
        <span className="truncate block font-medium">
          {disabled && (value === 0 || value === '') ? 'N/A' : displayValue}
        </span>

        {/* Hover hint icon */}
        {!disabled && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-brand-50 p-1 rounded text-brand-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit Mode Inputs
  // Added min-w-[110px] to ensure input has space even in tight columns without being excessively wide
  const inputBaseClasses = "w-full min-w-[110px] rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm py-1.5 px-3 border bg-white text-slate-900 outline-none transition-shadow";

  return (
    <div className="flex items-center w-full animate-in zoom-in-95 duration-100 origin-left relative z-10">
      {type === 'select' ? (
        <select
          ref={inputRef as any}
          value={tempValue}
          onChange={(e) => {
            setTempValue(e.target.value);
            onSave(e.target.value);
            setIsEditing(false);
          }}
          onBlur={() => setIsEditing(false)}
          className={inputBaseClasses}
        >
          {options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <div className="relative w-full flex items-center group">
          <input
            ref={inputRef as any}
            type={type === 'percent' ? 'number' : type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            // pr-16 ensures text doesn't slide under the buttons
            className={`${inputBaseClasses} ${type === 'percent' ? 'pr-20' : 'pr-16'}`}
          />

          {/* Controls embedded in input for better layout safety */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {type === 'percent' && (
              <span className="text-slate-400 text-xs font-medium">%</span>
            )}
            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
              <button
                onClick={handleSave}
                className="p-1 hover:bg-white text-green-600 rounded-sm hover:shadow-sm transition-all"
                title="Save (Enter)"
              >
                <Check size={12} strokeWidth={3} />
              </button>
              <div className="w-px bg-slate-200 my-0.5 mx-0.5"></div>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-white text-slate-400 hover:text-red-500 rounded-sm hover:shadow-sm transition-all"
                title="Cancel (Esc)"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};