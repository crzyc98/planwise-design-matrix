import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EditFieldModal } from './EditFieldModal'
import { getFieldConfig } from '../utils/fieldConfig'

interface ExtractedField {
  field_name: string
  field_category: string
  value: any
  confidence_score: number
  status: string
}

interface Props {
  clientId: string
  clientName?: string
}

interface FieldUpdate {
  new_value: string
  reason: string
  notes?: string
  updated_by: string
}

export default function PlanDesignMatrix({ clientId }: Props) {
  const [editingField, setEditingField] = useState<ExtractedField | null>(null)
  const [editingInline, setEditingInline] = useState<string | null>(null) // field_name being edited inline
  const [inlineValue, setInlineValue] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  const { data: extractions, isLoading } = useQuery<ExtractedField[]>({
    queryKey: ['extractions', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/clients/${clientId}/extractions`)
      if (!response.ok) throw new Error('Failed to fetch extractions')
      return response.json()
    },
    enabled: !!clientId,
  })

  const updateFieldMutation = useMutation({
    mutationFn: async ({ fieldName, update }: { fieldName: string; update: FieldUpdate }) => {
      const response = await fetch(
        `http://localhost:8000/api/v1/clients/${clientId}/fields/${fieldName}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.message || errorData.detail || 'Failed to update field');
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extractions', clientId] })
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
    },
  })

  const handleSaveField = async (update: FieldUpdate) => {
    if (!editingField) return
    await updateFieldMutation.mutateAsync({
      fieldName: editingField.field_name,
      update,
    })
  }

  // Inline editing handlers
  const startInlineEdit = (field: ExtractedField) => {
    setEditingInline(field.field_name)
    // Format the current value for editing
    let displayValue = field.value?.toString() || ''
    const numValue = typeof field.value === 'string' ? parseFloat(field.value) : field.value
    if (typeof numValue === 'number' && !isNaN(numValue) && numValue > 0 && numValue <= 1 &&
      (field.field_name.toLowerCase().includes('rate') || field.field_name.toLowerCase().includes('cap'))) {
      displayValue = `${Math.round(numValue * 100)}%`
    }
    setInlineValue(displayValue)
  }

  const cancelInlineEdit = () => {
    setEditingInline(null)
    setInlineValue('')
  }

  const saveInlineEdit = async (fieldName: string, newValue: string) => {
    setIsSaving(true)
    try {
      // Convert percentage strings back to decimals if needed
      let valueToSend = newValue
      if (typeof newValue === 'string' && newValue.endsWith('%')) {
        const percentValue = parseFloat(newValue.replace('%', ''))
        valueToSend = (percentValue / 100).toString()
      }

      await updateFieldMutation.mutateAsync({
        fieldName,
        update: {
          new_value: valueToSend,
          reason: '',
          updated_by: 'user@planwise.com',
        },
      })
      setEditingInline(null)
      setInlineValue('')
    } catch (error) {
      console.error('Failed to save inline edit:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Group extractions by category
  const groupedExtractions = extractions?.reduce((acc, field) => {
    const category = field.field_category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(field)
    return acc
  }, {} as Record<string, ExtractedField[]>) || {}

  const categories = Object.keys(groupedExtractions).sort()

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Plan Design Matrix</h2>
        <p className="text-sm text-gray-500 mt-1">
          {extractions?.length || 0} data points
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
          Loading plan data...
        </div>
      ) : !extractions || extractions.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
          No plan data available
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {category}
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  {groupedExtractions[category].length} fields
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {groupedExtractions[category].map((field, idx) => {
                  // Check if this field should be disabled based on dependencies
                  const isAutoEnrollmentRate = field.field_name === 'Auto-Enrollment Rate'
                  const autoEnrollmentField = extractions?.find(f => f.field_name === 'Auto-Enrollment')
                  const isAutoEnrollmentEnabled = autoEnrollmentField?.value === true || autoEnrollmentField?.value === 'true'

                  const isAutoEscalationRate = field.field_name === 'Auto-Escalation Rate'
                  const isAutoEscalationCap = field.field_name === 'Auto-Escalation Cap'
                  const autoEscalationField = extractions?.find(f => f.field_name === 'Auto-Escalation')
                  const isAutoEscalationEnabled = autoEscalationField?.value === true || autoEscalationField?.value === 'true'

                  const isFieldDisabled =
                    (isAutoEnrollmentRate && !isAutoEnrollmentEnabled) ||
                    ((isAutoEscalationRate || isAutoEscalationCap) && !isAutoEscalationEnabled)

                  return (
                    <div
                      key={idx}
                      className={`group px-6 py-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between ${isFieldDisabled ? 'opacity-50' : ''
                        }`}
                    >
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {field.field_name}
                        </div>
                        <div className="flex items-center gap-3">
                          {editingInline === field.field_name ? (
                            // INLINE EDITING MODE
                            <div className="flex items-center gap-2">
                              {(() => {
                                const config = getFieldConfig(field.field_name)

                                if (config.type === 'boolean') {
                                  // Toggle for boolean
                                  return (
                                    <select
                                      value={inlineValue}
                                      onChange={(e) => {
                                        saveInlineEdit(field.field_name, e.target.value)
                                      }}
                                      onBlur={cancelInlineEdit}
                                      autoFocus
                                      className="text-sm border border-primary-blue rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                    >
                                      <option value="true">Yes</option>
                                      <option value="false">No</option>
                                    </select>
                                  )
                                } else if (config.type === 'enum' && config.options) {
                                  // Dropdown for enum
                                  return (
                                    <select
                                      value={inlineValue}
                                      onChange={(e) => {
                                        saveInlineEdit(field.field_name, e.target.value)
                                      }}
                                      onBlur={cancelInlineEdit}
                                      autoFocus
                                      className="text-sm border border-primary-blue rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                                    >
                                      {config.options.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  )
                                } else {
                                  // Text input for everything else
                                  return (
                                    <input
                                      type="text"
                                      value={inlineValue}
                                      onChange={(e) => setInlineValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveInlineEdit(field.field_name, inlineValue)
                                        } else if (e.key === 'Escape') {
                                          cancelInlineEdit()
                                        }
                                      }}
                                      onBlur={() => saveInlineEdit(field.field_name, inlineValue)}
                                      autoFocus
                                      className="text-sm border border-primary-blue rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-blue w-48"
                                    />
                                  )
                                }
                              })()}
                              {isSaving && <span className="text-xs text-gray-500">Saving...</span>}
                            </div>
                          ) : (
                            // DISPLAY MODE
                            <>
                              <div
                                className={`text-sm text-gray-600 flex items-center gap-2 ${isFieldDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-primary-blue'
                                  }`}
                                onClick={() => !isFieldDisabled && startInlineEdit(field)}
                                title={
                                  isFieldDisabled
                                    ? isAutoEnrollmentRate
                                      ? 'Enable Auto-Enrollment first'
                                      : 'Enable Auto-Escalation first'
                                    : 'Click to edit'
                                }
                              >
                                {isFieldDisabled ? (
                                  <span className="text-gray-400 italic">N/A</span>
                                ) : typeof field.value === 'boolean' ? (
                                  field.value ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                      No
                                    </span>
                                  )
                                ) : (
                                  <span className="font-mono text-gray-800">
                                    {(() => {
                                      // Format decimal percentages (0.03 -> 3%)
                                      const numValue = typeof field.value === 'string' ? parseFloat(field.value) : field.value;
                                      if (typeof numValue === 'number' && !isNaN(numValue) && numValue > 0 && numValue <= 1 &&
                                        (field.field_name.toLowerCase().includes('rate') ||
                                          field.field_name.toLowerCase().includes('cap'))) {
                                        return `${Math.round(numValue * 100)}%`;
                                      }
                                      return field.value || '—';
                                    })()}
                                  </span>
                                )}
                              </div>
                              {!isFieldDisabled && (
                                <button
                                  onClick={() => setEditingField(field)}
                                  className="text-xs text-gray-400 hover:text-primary-blue font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Open full editor"
                                >
                                  <span>⋯</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Field Modal */}
      {editingField && (
        <EditFieldModal
          open={!!editingField}
          onClose={() => setEditingField(null)}
          clientId={clientId}
          fieldName={editingField.field_name}
          currentValue={editingField.value}
          onSave={handleSaveField}
        />
      )}
    </div>
  )
}