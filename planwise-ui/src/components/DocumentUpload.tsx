export default function DocumentUpload() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📄</span>
          <h3 className="font-semibold text-gray-900">Document Upload</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Drag & Drop Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-blue transition-colors cursor-pointer">
          <div className="space-y-2">
            <div className="text-4xl">📤</div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary-blue">Drop files here</span>
              <br />
              or click to browse
            </div>
          </div>
        </div>

        {/* File List (Mock) */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📑</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                Form 5500 - 2024.pdf
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Processing
                </span>
              </div>
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-blue animate-pulse" style={{ width: '67%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📑</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                Plan Document.pdf
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-green/10 text-success-green">
                  ✓ Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}