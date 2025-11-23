import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import ConsultingViews from './pages/ConsultingViews'
import AuditLogViewer from './components/AuditLogViewer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'consulting' | 'audit-log'>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string>('CLI_001');
  const [selectedClientName, setSelectedClientName] = useState<string>('');

  const handleViewConsulting = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setCurrentView('consulting');
  };

  return (
    <QueryClientProvider client={queryClient}>
      {currentView === 'dashboard' ? (
        <>
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setCurrentView('audit-log')}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
            >
              📋 View Audit Log
            </button>
          </div>
          <Dashboard onViewConsulting={handleViewConsulting} />
        </>
      ) : currentView === 'consulting' ? (
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '1rem',
              zIndex: 100,
              padding: '0.5rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← Back to Dashboard
          </button>
          <ConsultingViews clientId={selectedClientId} clientName={selectedClientName} />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <span className="mr-2">←</span> Back to Dashboard
              </button>
            </div>
            <AuditLogViewer />
          </div>
        </div>
      )}
    </QueryClientProvider>
  )
}

export default App