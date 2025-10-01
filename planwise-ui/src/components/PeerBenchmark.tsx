import { useQuery } from '@tanstack/react-query'

interface Props {
  clientId: string
}

export default function PeerBenchmark({ clientId }: Props) {
  const { data: peerData } = useQuery({
    queryKey: ['peers', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/clients/${clientId}/peers`)
      if (!response.ok) throw new Error('Failed to fetch peer data')
      return response.json()
    },
    enabled: !!clientId,
  })

  const benchmarks = peerData?.benchmarks || {}

  const renderBenchmark = (title: string, subtitle: string, data: any) => {
    if (!data) return null

    const yourValue = typeof data.your_value === 'number' ? (data.your_value * 100).toFixed(1) : 0
    const peerAvg = typeof data.peer_average === 'number' ? (data.peer_average * 100).toFixed(1) : 0

    return (
      <div className="p-4 border-b border-gray-100 last:border-b-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
          </div>
          <span className="text-lg">{data.quartile_label === 'Excellent' ? '✅' : '📊'}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">You</span>
            <span className="text-lg font-bold text-primary-blue">{yourValue}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-blue"
              style={{ width: `${yourValue}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Industry: {peerAvg}%</span>
            <span className="font-medium text-success-green">{data.quartile_label}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📈</span>
          <h3 className="font-semibold text-gray-900">Peer Benchmark</h3>
        </div>
      </div>

      <div>
        {renderBenchmark('Employer Match', 'vs Industry', benchmarks.employer_match)}
        {renderBenchmark('Auto-Enrollment Rate', 'Above Avg', benchmarks.auto_enrollment_rate)}
        {renderBenchmark('Participation Rate', 'Excellent', benchmarks.participation_rate)}
      </div>
    </div>
  )
}