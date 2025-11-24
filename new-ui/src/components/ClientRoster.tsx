import React, { useState, useMemo } from 'react';
import { Client, PlanData } from '../types';
import { InlineInput } from './InlineInput';
import { Search, Filter, ArrowUpDown, CheckSquare, Square, X, Save, Plus, MoreHorizontal } from 'lucide-react';
import { FIELD_DEFINITIONS } from '../constants';

interface ClientRosterProps {
  clients: Client[];
  onUpdateClient: (clientId: string, field: keyof PlanData, value: any) => void;
  onSelectClient: (clientId: string) => void;
  onAddClient: (data: { name: string; industry: string; region: string; state?: string }) => void;
}

const STATE_REGION_MAP: Record<string, string> = {
  // Northeast
  'ME': 'Northeast', 'NH': 'Northeast', 'VT': 'Northeast', 'MA': 'Northeast', 
  'RI': 'Northeast', 'CT': 'Northeast', 'NY': 'Northeast', 'NJ': 'Northeast', 
  'PA': 'Northeast',
  
  // Midwest
  'OH': 'Midwest', 'MI': 'Midwest', 'IN': 'Midwest', 'IL': 'Midwest', 
  'WI': 'Midwest', 'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest', 
  'ND': 'Midwest', 'SD': 'Midwest', 'NE': 'Midwest', 'KS': 'Midwest',

  // South
  'DE': 'South', 'MD': 'South', 'DC': 'South', 'VA': 'South', 'WV': 'South', 
  'NC': 'South', 'SC': 'South', 'GA': 'South', 'FL': 'South', 'KY': 'South', 
  'TN': 'South', 'AL': 'South', 'MS': 'South', 'AR': 'South', 'LA': 'South', 
  'OK': 'South', 'TX': 'South',

  // West Coast / Pacific
  'WA': 'Pacific Northwest', 'OR': 'Pacific Northwest', 
  'CA': 'West Coast', 'AK': 'West Coast', 'HI': 'West Coast',

  // Mountain West
  'MT': 'Mountain West', 'ID': 'Mountain West', 'WY': 'Mountain West', 
  'NV': 'Mountain West', 'UT': 'Mountain West', 'CO': 'Mountain West', 
  'AZ': 'Mountain West', 'NM': 'Mountain West'
};

const US_STATES = Object.keys(STATE_REGION_MAP).sort();

const INDUSTRIES = [
  'Association',
  'Credit Union',
  'Energy',
  'Finance',
  'Healthcare',
  'Higher Education',
  'Insurance',
  'Manufacturing',
  'Professional Services',
  'Public Sector',
  'Religious Organization',
  'Research Institution',
  'Retail',
  'Technology',
  'Union'
];

export const ClientRoster: React.FC<ClientRosterProps> = ({ clients, onUpdateClient, onSelectClient, onAddClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Client | 'autoEnrollmentRate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  
  // Bulk Edit State
  const [bulkField, setBulkField] = useState<keyof PlanData | ''>('');
  const [bulkValue, setBulkValue] = useState<any>('');

  // Add Client State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', industry: 'Technology', region: '', state: '' });

  // --- Filtering & Sorting ---
  const filteredClients = useMemo(() => {
    let result = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      let aVal: any = a[sortField as keyof Client];
      let bVal: any = b[sortField as keyof Client];

      // Handle nested plan properties for sorting
      if (sortField === 'autoEnrollmentRate') {
          aVal = a.plan.autoEnrollmentRate;
          bVal = b.plan.autoEnrollmentRate;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clients, searchTerm, sortField, sortDirection]);

  // --- Selection Logic ---
  const handleSelectAll = () => {
    if (selectedClientIds.size === filteredClients.length) {
      setSelectedClientIds(new Set());
    } else {
      setSelectedClientIds(new Set(filteredClients.map(c => c.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedClientIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedClientIds(newSet);
  };

  const handleSort = (field: keyof Client | 'autoEnrollmentRate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --- Bulk Update Logic ---
  const applyBulkUpdate = () => {
    if (!bulkField) return;
    
    // Iterate through selected IDs and call update
    Array.from(selectedClientIds).forEach(id => {
       onUpdateClient(id, bulkField as keyof PlanData, bulkValue);
    });

    // Reset selection and bulk state
    setSelectedClientIds(new Set());
    setBulkField('');
    setBulkValue('');
  };

  // --- Add Client Logic ---
  const handleCreateClient = () => {
    if (!newClientData.name.trim()) return;
    onAddClient({
      name: newClientData.name,
      industry: newClientData.industry,
      region: newClientData.region || 'National', // Fallback if no state selected
      state: newClientData.state
    });
    setIsAddModalOpen(false);
    setNewClientData({ name: '', industry: 'Technology', region: '', state: '' });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    const region = STATE_REGION_MAP[state] || newClientData.region;
    setNewClientData(prev => ({
      ...prev,
      state,
      region
    }));
  };

  // --- Columns Config ---
  // A subset of fields to show in the roster view for high-density editing
  const columns = [
    { id: 'serviceRequirement', label: 'Eligibility', width: 'w-48', type: 'select', options: ['Immediate', '3 Months', '6 Months', '1,000 Hours', '1 Year', '1 Year + 1,000 Hours'] },
    { id: 'entryDate', label: 'Entry Date', width: 'w-32', type: 'select', options: ['Immediate', 'Monthly', 'Quarterly', 'Semi-Annual'] },
    { id: 'autoEnrollment', label: 'Auto Enroll', width: 'w-24', type: 'boolean' },
    { id: 'autoEnrollmentRate', label: 'Default %', width: 'w-28', type: 'percent' },
    { id: 'autoEscalation', label: 'Auto Esc', width: 'w-24', type: 'boolean' },
    { id: 'autoEscalationCap', label: 'Esc Cap', width: 'w-28', type: 'percent' },
    { id: 'employerMatch', label: 'Match Formula', width: 'w-56', type: 'text' },
    { id: 'matchCap', label: 'Match Cap', width: 'w-24', type: 'percent' },
    { id: 'vestingSchedule', label: 'Vesting Type', width: 'w-32', type: 'select', options: ['Immediate', 'Cliff', 'Graded'] },
    { id: 'vestingCliff', label: 'Years', width: 'w-20', type: 'number' },
  ];

  const isFieldDisabled = (colId: string, plan: PlanData) => {
    if (colId === 'autoEnrollmentRate' && !plan.autoEnrollment) return true;
    if (colId === 'autoEscalationCap' && !plan.autoEscalation) return true;
    if (colId === 'vestingCliff' && plan.vestingSchedule === 'Immediate') return true;
    return false;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-180px)] overflow-hidden relative">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search clients by name, industry or region..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
          />
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 shadow-sm transition-all"
           >
             <Plus size={16} /> New Client
           </button>
           <div className="w-px bg-slate-200 mx-1 h-8"></div>
           <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100">
              <Filter size={16} /> Filter
           </button>
        </div>
      </div>

      {/* Bulk Actions Header */}
      {selectedClientIds.size > 0 && (
        <div className="bg-brand-50 border-b border-brand-100 p-3 flex items-center gap-4 animate-in slide-in-from-top-2">
          <span className="text-sm font-semibold text-brand-800">{selectedClientIds.size} Selected</span>
          <div className="h-4 w-px bg-brand-200"></div>
          <div className="flex items-center gap-2">
             <select
               value={bulkField}
               onChange={(e) => setBulkField(e.target.value as keyof PlanData)}
               className="text-sm border-brand-200 rounded-md focus:ring-brand-500 text-slate-700 bg-white shadow-sm"
             >
               <option value="">Select Field to Update...</option>
               {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
             </select>
             {bulkField && (
                <>
                  <input 
                    type={columns.find(c => c.id === bulkField)?.type === 'number' ? 'number' : 'text'}
                    placeholder="New Value"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="text-sm border-brand-200 rounded-md focus:ring-brand-500 text-slate-900 bg-white shadow-sm w-32 px-2 py-1"
                  />
                  <button 
                    onClick={applyBulkUpdate}
                    className="px-3 py-1 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 flex items-center gap-1"
                  >
                    <Save size={14} /> Apply
                  </button>
                </>
             )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
            <tr>
               <th className="p-3 w-10 border-r border-slate-200/50 bg-slate-50">
                 <button onClick={handleSelectAll} className="text-slate-400 hover:text-brand-600 transition-colors">
                   {selectedClientIds.size === filteredClients.length && filteredClients.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                 </button>
               </th>
               <th className="p-3 font-semibold text-xs text-slate-500 uppercase cursor-pointer hover:text-brand-600 border-r border-slate-200/50 min-w-[200px] sticky left-0 z-20 bg-slate-50" onClick={() => handleSort('name')}>
                 <div className="flex items-center gap-1">Client Name <ArrowUpDown size={12} /></div>
               </th>
               {columns.map(col => (
                 <th key={col.id} className={`p-3 font-semibold text-xs text-slate-500 uppercase ${col.width} border-r border-slate-200/50`}>
                   {col.label}
                 </th>
               ))}
               <th className="p-3 text-center w-10 sticky right-0 bg-slate-50 z-20 border-l border-slate-200">
               </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {filteredClients.map(client => (
                <tr key={client.id} className={`hover:bg-slate-50 transition-colors group ${selectedClientIds.has(client.id) ? 'bg-brand-50/30' : ''}`}>
                   
                   {/* Checkbox */}
                   <td className="p-3 border-r border-slate-100">
                      <button onClick={() => handleSelectRow(client.id)} className={`transition-colors ${selectedClientIds.has(client.id) ? 'text-brand-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                        {selectedClientIds.has(client.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                   </td>

                   {/* Client Name & Info */}
                   <td className="p-3 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                      <div className="cursor-pointer" onClick={() => onSelectClient(client.id)}>
                        <div className="font-medium text-slate-900 text-sm">{client.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{client.industry} • {client.state || client.region}</div>
                      </div>
                   </td>

                   {/* Dynamic Data Columns */}
                   {columns.map(col => (
                     <td key={`${client.id}-${col.id}`} className="p-3 border-r border-slate-100 last:border-0 align-middle">
                       <InlineInput
                         type={col.type as any}
                         value={client.plan[col.id as keyof PlanData]}
                         options={col.options}
                         disabled={isFieldDisabled(col.id, client.plan)}
                         onSave={(val) => onUpdateClient(client.id, col.id as keyof PlanData, val)}
                         className="text-sm"
                       />
                     </td>
                   ))}

                   {/* Row Action */}
                   <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 border-l border-slate-100 z-10">
                      <button 
                        onClick={() => onSelectClient(client.id)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-all" 
                        title="View Full Details"
                      >
                         <MoreHorizontal size={16} />
                      </button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">Add New Client</h3>
               <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
                 <input 
                   type="text" 
                   value={newClientData.name}
                   onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm bg-white text-slate-900"
                   placeholder="e.g. Acme Corp"
                   autoFocus
                 />
               </div>
               
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Industry</label>
                 <select 
                   value={newClientData.industry}
                   onChange={(e) => setNewClientData({...newClientData, industry: e.target.value})}
                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm bg-white text-slate-900"
                 >
                   {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                 </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">State</label>
                   <select 
                     value={newClientData.state}
                     onChange={handleStateChange}
                     className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm bg-white text-slate-900"
                   >
                     <option value="">Select...</option>
                     {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Region</label>
                   <input 
                     type="text" 
                     value={newClientData.region}
                     readOnly
                     className="w-full rounded-md border-slate-200 bg-slate-100 text-slate-500 shadow-sm py-2 text-sm cursor-not-allowed"
                     placeholder="Auto-populated"
                   />
                 </div>
               </div>

            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
               <button 
                 onClick={() => setIsAddModalOpen(false)} 
                 className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleCreateClient} 
                 className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
               >
                 Create Client
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};