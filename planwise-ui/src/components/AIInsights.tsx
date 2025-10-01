interface Props {
  clientId: string
}

export default function AIInsights({ clientId }: Props) {
  const insights = [
    { type: 'success', message: '12 plan features extracted' },
    { type: 'success', message: 'Vesting schedule validated' },
    { type: 'warning', message: 'Review match formula' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🤖</span>
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start space-x-2 text-sm">
            <span className="text-lg">
              {insight.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className={insight.type === 'success' ? 'text-gray-700' : 'text-warning-yellow font-medium'}>
              {insight.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}