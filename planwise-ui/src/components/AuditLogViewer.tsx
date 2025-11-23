import { useQuery } from '@tanstack/react-query'

interface AuditLogEntry {
    id: string
    timestamp: string
    old_value: string | null
    new_value: string
    updated_by: string
    reason: string
    notes: string | null
}

export default function AuditLogViewer() {
    const { data: auditLog, isLoading } = useQuery<AuditLogEntry[]>({
        queryKey: ['auditLog'],
        queryFn: async () => {
            const response = await fetch('http://localhost:8000/api/v1/audit-log')
            if (!response.ok) throw new Error('Failed to fetch audit log')
            return response.json()
        },
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Global Audit Log</h2>
                <p className="text-sm text-gray-500">Track all data changes across the platform</p>
            </div>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading audit history...</div>
                ) : !auditLog || auditLog.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No audit history available</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Change
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {auditLog.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(entry.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {entry.updated_by}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-mono">
                                                {entry.old_value || 'ø'}
                                            </span>
                                            <span className="text-gray-400">→</span>
                                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-mono">
                                                {entry.new_value}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                            {entry.reason.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {entry.notes || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
