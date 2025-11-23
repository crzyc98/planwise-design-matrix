export default function Recommendations() {
  const recommendations = [
    {
      title: 'Consider increasing match',
      subtitle: '50% of peers offer 4%+ match',
      type: 'opportunity'
    },
    {
      title: 'Strong vesting policy',
      subtitle: 'Aligned with best practices',
      type: 'strength'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold text-gray-900">Recommendations</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${rec.type === 'opportunity'
              ? 'border-warning-yellow/30 bg-warning-yellow/5'
              : 'border-success-green/30 bg-success-green/5'
              }`}
          >
            <div className="font-medium text-gray-900 text-sm mb-1">
              {rec.title}
            </div>
            <div className="text-xs text-gray-600">
              {rec.subtitle}
            </div>
          </div>
        ))}

        <button className="w-full mt-2 px-4 py-2 text-sm font-medium text-primary-blue border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          View All Recommendations →
        </button>
      </div>
    </div>
  )
}