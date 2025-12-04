import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, PieChart, Settings, Users, Bell, Search, Menu, ChevronDown, CheckCircle2, ClipboardCheck, FileText } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanMatrix } from './components/PlanMatrix';
import { RegionalBenchmark } from './components/RegionalBenchmark';
import { Scorecard } from './components/Scorecard';
import { Assessment } from './components/Assessment';
import { ClientRoster } from './components/ClientRoster';
import { useClients, useCreateClient } from './hooks/useClients';
import { usePlanData } from './hooks/usePlanData';
import { useUpdateField, useGenericUpdateField } from './hooks/useUpdateField';
import { Client } from './types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// --- Client Selector Component ---
interface ClientSelectorProps {
  clients: Client[];
  selectedClientId: string;
  onSelect: (id: string) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients, selectedClientId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.industry && client.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!selectedClient) return <div className="text-sm text-slate-500">Loading clients...</div>;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer border border-slate-200 rounded-lg px-3 py-2 hover:border-brand-500 hover:bg-brand-50 transition-all bg-white min-w-[260px] shadow-sm group"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200 group-hover:text-indigo-800 transition-colors flex items-center justify-center font-bold text-xs shrink-0">
          {selectedClient.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium truncate">Current Client</p>
          <p className="text-sm font-bold text-slate-800 truncate">{selectedClient.name}</p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => {
                    onSelect(client.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${client.id === selectedClientId ? 'bg-brand-50 border-brand-100' : ''}`}
                >
                  <div className="font-medium text-slate-900 text-sm">{client.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{client.industry} • {client.region}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">No clients found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Dashboard Component ---
const DashboardContent: React.FC = () => {
  const { data: clients, isLoading: isLoadingClients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('matrix');

  // Select first client when loaded
  useEffect(() => {
    if (clients && clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const { data: planData, isLoading: isLoadingPlan, isError: isPlanError } = usePlanData(selectedClientId);
  const updateFieldMutation = useUpdateField(selectedClientId);
  const genericUpdateFieldMutation = useGenericUpdateField();
  const createClientMutation = useCreateClient();

  const handleUpdateField = (field: any, value: any) => {
    updateFieldMutation.mutate({ fieldId: field, value });
  };

  const handleGenericUpdateField = (clientId: string, field: any, value: any) => {
    genericUpdateFieldMutation.mutate({ clientId, fieldId: field, value });
  };

  const handleCreateClient = (data: { name: string; industry: string; region: string; state?: string }) => {
    createClientMutation.mutate(data);
  };

  if (isLoadingClients) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading clients...</div>;
  }

  if (!clients || clients.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">No clients found. Please ensure backend is running.</div>;
  }

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // Merge loaded plan data into client object for child components
  const clientWithPlan = {
    ...selectedClient,
    plan: planData || {} as any
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center shadow-md shadow-brand-200">
                <LayoutDashboard className="text-white" size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Fidelity <span className="text-brand-600">PlanAlign</span> Studio (NEW)
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'matrix' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Plan Design
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'assessment' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Strategic Assessment
              </button>
              <button
                onClick={() => setActiveTab('roster')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'roster' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Client Roster
              </button>
              <button
                onClick={() => setActiveTab('benchmark')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'benchmark' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Peer Analysis
              </button>
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'scorecard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Scorecard
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ClientSelector
              clients={clients}
              selectedClientId={selectedClientId}
              onSelect={setSelectedClientId}
            />

            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white cursor-pointer">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Clients</span>
              <span className="text-slate-300">/</span>
              <span>{selectedClient.name}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-medium">Plan Design</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'matrix' && 'Plan Design Matrix'}
              {activeTab === 'assessment' && 'Strategic Assessment'}
              {activeTab === 'roster' && 'Client Roster'}
              {activeTab === 'benchmark' && 'Peer Benchmarking'}
              {activeTab === 'scorecard' && 'Plan Health Scorecard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <CheckCircle2 size={14} />
              <span>Data Verified</span>
            </div>
            <span className="text-xs text-slate-400">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content Area */}
        {isLoadingPlan ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : isPlanError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 font-medium mb-2">Failed to load plan data</p>
              <p className="text-slate-500 text-sm">Please try refreshing the page or check if the backend is running.</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'matrix' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PlanMatrix
                  planData={clientWithPlan.plan}
                  onUpdateField={handleUpdateField}
                />
              </div>
            )}

            {activeTab === 'assessment' && (
              <Assessment client={clientWithPlan} />
            )}

            {activeTab === 'roster' && (
              <ClientRoster
                clients={clients}
                onUpdateClient={(clientId, field, value) => handleGenericUpdateField(clientId, field, value)}
                onSelectClient={setSelectedClientId}
                onAddClient={handleCreateClient}
              />
            )}

            {activeTab === 'benchmark' && (
              <RegionalBenchmark client={clientWithPlan} />
            )}

            {activeTab === 'scorecard' && (
              <Scorecard client={clientWithPlan} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

export default App;