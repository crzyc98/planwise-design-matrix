import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EditFieldModal } from './EditFieldModal'

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

export default function PlanDesignMatrix({ clientId, clientName }: Props) {
  const [editingField, setEditingField] = useState<ExtractedField | null>(null)
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
      if (!response.ok) throw new Error('Failed to update field')
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

  const getStatusBadge = (status: string) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-green/10 text-success-green">
          ✓ Verified
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-red/10 text-danger-red">
          ⚠ Review
        </span>
    )
  }

  const getConfidenceBar = (score: number) => {
    const percentage = Math.round(score * 100)
    let colorClass = 'bg-success-green'
    if (percentage < 70) colorClass = 'bg-danger-red'
    else if (percentage < 88) colorClass = 'bg-warning-yellow'

    return (
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600 w-10">{percentage}%</span>
      </div>
    )
  }

  const verifiedCount = extractions?.filter(e => e.status === 'verified').length || 0
  const reviewCount = extractions?.filter(e => e.status === 'review').length || 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">📊</span>
          <h2 className="text-lg font-semibold text-gray-900">Plan Design Matrix</h2>
        </div>
        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
          ⚙️ Configure
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading plan data...</div>
        ) : !extractions || extractions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No plan data available</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {extractions.map((field, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {field.field_name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {field.field_category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {typeof field.value === 'boolean'
                        ? (field.value ? 'Yes' : 'No')
                        : field.value || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      {getConfidenceBar(field.confidence_score)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(field.status)}
                      <button
                        onClick={() => setEditingField(field)}
                        className="text-xs text-primary-blue hover:underline font-medium"
                      >
                        {field.status === 'review' ? 'Review' : 'Edit'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {extractions && extractions.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <span className="text-success-green font-medium">
              ✓ {verifiedCount} features validated
            </span>
            {reviewCount > 0 && (
              <span className="text-warning-yellow font-medium">
                ⚠ {reviewCount} requires review
              </span>
            )}
          </div>
          <button className="px-4 py-2 text-sm font-medium text-primary-blue border border-primary-blue rounded-md hover:bg-primary-blue hover:text-white transition-colors">
            Export Data
          </button>
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