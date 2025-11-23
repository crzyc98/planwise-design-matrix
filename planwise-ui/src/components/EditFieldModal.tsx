import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { getFieldConfig, type FieldConfig } from '../utils/fieldConfig';

interface EditFieldModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  fieldName: string;
  currentValue: any;
  onSave: (update: FieldUpdate) => Promise<void>;
}

interface FieldUpdate {
  new_value: string;
  reason: string;
  notes?: string;
  updated_by: string;
}

interface HistoryEntry {
  audit_id: string;
  timestamp: string;
  old_value: string;
  new_value: string;
  updated_by: string;
  reason: string;
  notes?: string;
}

const REASON_OPTIONS = [
  { value: 'data_correction', label: 'Data Correction' },
  { value: 'plan_amendment', label: 'Plan Amendment' },
  { value: 'missing_data_added', label: 'Missing Data Added' },
  { value: 'low_confidence_review', label: 'Low Confidence Review' },
  { value: 'annual_update', label: 'Annual Update' },
  { value: 'other', label: 'Other' },
];

export function EditFieldModal({
  open,
  onClose,
  clientId,
  fieldName,
  currentValue,
  onSave,
}: EditFieldModalProps) {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const config: FieldConfig = getFieldConfig(fieldName);

  useEffect(() => {
    if (open) {
      // Handle boolean values specifically
      if (typeof currentValue === 'boolean') {
        setNewValue(currentValue ? 'true' : 'false');
      } else {
        setNewValue(currentValue?.toString() || '');
      }
      loadHistory();
    }
  }, [open, currentValue]);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/clients/${clientId}/fields/${fieldName}/history`
      );
      if (response.ok) {
        const data = await response.json();
        setHistory(data.changes || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const validateValue = (value: string) => {
    if (!value && config.type !== 'boolean') { // Booleans are always valid (true/false)
      setIsValid(false);
      setValidationError('Value is required');
      return false;
    }

    if (config.type === 'number') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setIsValid(false);
        setValidationError('Must be a number');
        return false;
      }
      if (config.min !== undefined && numValue < config.min) {
        setIsValid(false);
        setValidationError(`Must be at least ${config.format === 'percent' ? (config.min * 100) + '%' : config.min}`);
        return false;
      }
      if (config.max !== undefined && numValue > config.max) {
        setIsValid(false);
        setValidationError(`Must not exceed ${config.format === 'percent' ? (config.max * 100) + '%' : config.max}`);
        return false;
      }
    }

    setIsValid(true);
    setValidationError('');
    return true;
  };

  const handleValueChange = (value: string) => {
    setNewValue(value);
    validateValue(value);
  };

  const handleSave = async () => {
    if (!validateValue(newValue)) {
      return;
    }

    setLoading(true);
    setValidationError(''); // Clear previous errors

    try {
      // Convert percentage strings (e.g., "3%") to decimals (e.g., "0.03") for backend
      let valueToSend = newValue;
      if (typeof newValue === 'string' && newValue.endsWith('%')) {
        const percentValue = parseFloat(newValue.replace('%', ''));
        valueToSend = (percentValue / 100).toString();
      }

      await onSave({
        new_value: valueToSend,
        reason,
        notes: notes || undefined,
        updated_by: 'user@planwise.com',
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to save:', error);
      // Try to extract error message from API response if available
      const message = error.message || 'Failed to save changes. Please try again.';
      setValidationError(message);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    switch (config.type) {
      case 'boolean':
        return (
          <div className="flex gap-4 mt-2">
            <label className={`flex items-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${newValue === 'true' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="boolean-field"
                value="true"
                checked={newValue === 'true'}
                onChange={(e) => handleValueChange(e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
            <label className={`flex items-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${newValue === 'false' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="boolean-field"
                value="false"
                checked={newValue === 'false'}
                onChange={(e) => handleValueChange(e.target.value)}
                className="mr-2"
              />
              No
            </label>
          </div>
        );

      case 'enum':
        return (
          <Select value={newValue} onValueChange={handleValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <div className="relative">
            <Input
              type="number"
              value={newValue}
              onChange={(e) => handleValueChange(e.target.value)}
              step={config.step || 'any'}
              min={config.min}
              max={config.max}
              className={!isValid ? 'border-red-500' : ''}
            />
            {config.format === 'percent' && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">% (enter as decimal, e.g. 0.03)</span>
              </div>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <Textarea
            value={newValue}
            onChange={(e) => handleValueChange(e.target.value)}
            className={!isValid ? 'border-red-500' : ''}
            rows={3}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Edit {config.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto px-1">
          {/* Current Value Display */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
            <Label className="text-xs text-gray-500 uppercase tracking-wider">Current Value</Label>
            <div className="mt-1 font-medium text-gray-900">
              {typeof currentValue === 'boolean'
                ? (currentValue ? 'Yes' : 'No')
                : (currentValue || 'Not set')}
            </div>
          </div>

          {/* New Value Input */}
          <div>
            <Label className="text-base font-medium">New Value</Label>
            {config.description && (
              <p className="text-sm text-gray-500 mb-2">{config.description}</p>
            )}

            {renderInput()}

            {!isValid && validationError && (
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600 font-medium">
                <span>⚠</span>
                {validationError}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Reason */}
          <div>
            <Label>Reason for Change <span className="text-gray-400 font-normal">(Optional)</span></Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label>Additional Notes <span className="text-gray-400 font-normal">(Optional)</span></Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context about this change..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          {/* Change History */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <Label className="mb-3 block text-sm text-gray-500">Recent Changes</Label>
              <div className="space-y-3">
                {history.slice(0, 3).map((entry) => (
                  <div key={entry.audit_id} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                      <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                      <span>{entry.updated_by.split('@')[0]}</span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {entry.old_value || 'ø'} → {entry.new_value}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 italic">
                      {entry.reason.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
