import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

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

  useEffect(() => {
    if (open) {
      setNewValue(currentValue?.toString() || '');
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
    // Basic validation - extend based on field type
    if (!value || value.trim() === '') {
      setIsValid(false);
      setValidationError('Value is required');
      return false;
    }

    // Numeric validation for rate fields
    if (fieldName.includes('rate') || fieldName.includes('cap')) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setIsValid(false);
        setValidationError('Must be a number');
        return false;
      }
      if (numValue < 0 || numValue > 0.20) {
        setIsValid(false);
        setValidationError('Must be between 0 and 0.20 (0% to 20%)');
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
    if (!validateValue(newValue) || !reason) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        new_value: newValue,
        reason,
        notes: notes || undefined,
        updated_by: 'user@planwise.com', // TODO: Get from auth context
      });
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Field: {fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          {/* Current Value */}
          <div>
            <Label>Current Value</Label>
            <Input
              value={currentValue?.toString() || 'Not set'}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* New Value */}
          <div>
            <Label>New Value</Label>
            <Input
              value={newValue}
              onChange={(e) => handleValueChange(e.target.value)}
              className={!isValid ? 'border-red-500' : ''}
            />
            {!isValid && validationError && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <span>⚠</span>
                {validationError}
              </div>
            )}
            {isValid && newValue && (
              <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                <span>✓</span>
                Valid
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label>Reason for Change *</Label>
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
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context..."
              rows={3}
            />
          </div>

          {/* Change History */}
          {history.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <Label className="mb-2 block">Change History</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.slice(0, 5).map((entry) => (
                  <div key={entry.audit_id} className="text-sm bg-gray-50 p-2 rounded">
                    <div className="font-medium">
                      {new Date(entry.timestamp).toLocaleDateString()} by {entry.updated_by}
                    </div>
                    <div className="text-gray-600">
                      {entry.old_value || '(empty)'} → {entry.new_value}
                    </div>
                    <div className="text-xs text-gray-500">
                      Reason: {entry.reason}
                      {entry.notes && ` - ${entry.notes}`}
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
            disabled={!isValid || !reason || loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
