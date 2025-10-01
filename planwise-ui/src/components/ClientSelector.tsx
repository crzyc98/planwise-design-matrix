import { useState } from 'react'

interface Client {
  client_id: string
  client_name: string
  plan_sponsor_name: string
  industry: string
  plan_type: string
  total_participants: number
}

interface Props {
  clients: Client[]
  selectedClientId: string
  onSelect: (clientId: string) => void
}

export default function ClientSelector({ clients, selectedClientId, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedClient = clients.find(c => c.client_id === selectedClientId)

  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.plan_sponsor_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-primary-blue/20 rounded-lg hover:border-primary-blue/40 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏢</span>
          <div className="text-left">
            <div className="font-semibold text-gray-900">
              {selectedClient?.client_name || 'Select a client'}
            </div>
            {selectedClient && (
              <div className="text-xs text-gray-500">
                {selectedClient.plan_type} • {selectedClient.total_participants.toLocaleString()} participants
              </div>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-hidden">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Client List */}
            <div className="overflow-y-auto max-h-80">
              {filteredClients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No clients found
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.client_id}
                    onClick={() => {
                      onSelect(client.client_id)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      client.client_id === selectedClientId ? 'bg-blue-50 border-l-4 border-primary-blue' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {client.industry === 'Healthcare' ? '🏥' :
                         client.industry === 'Education' ? '🎓' : '🏢'}
                      </span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm">
                          {client.client_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.plan_type}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {client.total_participants.toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}