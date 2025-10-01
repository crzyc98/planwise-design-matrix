import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ClientSelector from '../components/ClientSelector'
import PlanDesignMatrix from '../components/PlanDesignMatrix'
import PeerBenchmark from '../components/PeerBenchmark'
import DocumentUpload from '../components/DocumentUpload'
import AIInsights from '../components/AIInsights'
import Recommendations from '../components/Recommendations'

interface Client {
  client_id: string
  client_name: string
  plan_sponsor_name: string
  industry: string
  plan_type: string
  total_participants: number
}

interface DashboardProps {
  onViewConsulting: (clientId: string, clientName: string) => void;
}

export default function Dashboard({ onViewConsulting }: DashboardProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('CLI_001')

  // Fetch clients
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/v1/clients')
      if (!response.ok) throw new Error('Failed to fetch clients')
      return response.json()
    },
  })

  // Fetch selected client data
  const { data: clientData } = useQuery({
    queryKey: ['client', selectedClientId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/clients/${selectedClientId}`)
      if (!response.ok) throw new Error('Failed to fetch client')
      return response.json()
    },
    enabled: !!selectedClientId,
  })

  const selectedClient = clients?.find(c => c.client_id === selectedClientId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="bg-primary-blue text-white font-bold px-3 py-2 rounded">
                  PW
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-gray-900">
                    PlanWise Design Matrix
                  </h1>
                  <p className="text-xs text-gray-500">Enterprise Retirement Plan Analysis</p>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-8">
              <ClientSelector
                clients={clients || []}
                selectedClientId={selectedClientId}
                onSelect={setSelectedClientId}
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => selectedClient && onViewConsulting(selectedClientId, selectedClient.client_name)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-blue rounded-md hover:bg-blue-600"
              >
                📊 Consulting Views
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                ⚙️ Settings
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800">
                📄 Generate Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Document Upload & AI Insights */}
          <div className="col-span-3 space-y-6">
            <DocumentUpload clientId={selectedClientId} />
            <AIInsights clientId={selectedClientId} />
          </div>

          {/* Center Column - Plan Design Matrix */}
          <div className="col-span-6">
            <PlanDesignMatrix
              clientId={selectedClientId}
              clientName={selectedClient?.client_name}
            />
          </div>

          {/* Right Column - Peer Benchmark & Recommendations */}
          <div className="col-span-3 space-y-6">
            <PeerBenchmark clientId={selectedClientId} />
            <Recommendations clientId={selectedClientId} />
          </div>
        </div>
      </main>
    </div>
  )
}