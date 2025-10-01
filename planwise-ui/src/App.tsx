import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard'
import ConsultingViews from './pages/ConsultingViews'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'consulting'>('dashboard');
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
        <Dashboard onViewConsulting={handleViewConsulting} />
      ) : (
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
      )}
    </QueryClientProvider>
  )
}

export default App