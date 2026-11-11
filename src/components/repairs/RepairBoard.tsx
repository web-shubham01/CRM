import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Layers, 
  ListFilter, 
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { RepairTicket, RepairStatus, RepairPriority, DiagnosticsChecklist, Customer } from '../../types';

const statusColumns: { id: RepairStatus; label: string; dotColor: string }[] = [
  { id: 'RECEIVED', label: 'Intake / Queue', dotColor: 'bg-slate-400' },
  { id: 'IN_DIAGNOSIS', label: 'Diagnosis Bench', dotColor: 'bg-teal-500' },
  { id: 'WAITING_PARTS', label: 'Waiting for Parts', dotColor: 'bg-amber-500' },
  { id: 'IN_PROGRESS', label: 'In Repair', dotColor: 'bg-teal-600' },
  { id: 'TESTING_QC', label: 'Testing & QC', dotColor: 'bg-indigo-500' },
  { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup', dotColor: 'bg-emerald-500' },
  { id: 'COMPLETED_DELIVERED', label: 'Delivered & Closed', dotColor: 'bg-slate-300' }
];

const commonIssues = [
  'Screen Cracked / No Display',
  'Touch Unresponsive / Ghost Touch',
  'Battery Degradation / Rapid Drain',
  'Liquid / Water Damage Exposure',
  'No Fast Charging / Port Damaged',
  'Microphone or Earpiece Distorted',
  'Rear Camera Blurry / Shaking OIS',
  'Face ID / Biometrics Failure',
  'Logic Board Short / No Boot'
];

export const RepairBoard: React.FC = () => {
  const { 
    repairTickets, 
    spareParts, 
    customers, 
    createRepairTicket, 
    updateRepairTicket, 
    changeRepairStatus, 
    allocatePartToRepair, 
    setActiveJobSheetModal, 
    storeSettings,
    isCompactDensity 
  } = useStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modals
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  
  // Part allocation inside ticket drawer
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedPartQty, setSelectedPartQty] = useState(1);
  const [techNoteText, setTechNoteText] = useState('');

  // Intake Form State
  const [existingCustomerSearch, setExistingCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [cosmeticNotes, setCosmeticNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(120);
  const [deposit, setDeposit] = useState<number>(30);
  const [technician, setTechnician] = useState('Alex Rivera (Lead Micro-Tech)');
  const [priority, setPriority] = useState<RepairPriority>('Normal');

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return repairTickets.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        t.ticketNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q) ||
        t.deviceModel.toLowerCase().includes(q) ||
        t.imeiOrSerial.includes(q);

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [repairTickets, searchQuery, statusFilter]);

  // Aggregate Metrics
  const activeCount = repairTickets.filter(t => t.status !== 'COMPLETED_DELIVERED' && t.status !== 'CANCELLED_RETURNED').length;
  const waitingPartsCount = repairTickets.filter(t => t.status === 'WAITING_PARTS').length;
  const readyPickupCount = repairTickets.filter(t => t.status === 'READY_FOR_PICKUP').length;

  const toggleIssue = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  // Autocomplete customer selection
  const matchingCustomers = useMemo(() => {
    if (!existingCustomerSearch.trim()) return [];
    const q = existingCustomerSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5);
  }, [customers, existingCustomerSearch]);

  const handleSelectExistingCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustEmail(c.email || '');
    setExistingCustomerSearch('');
  };

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !model || !imei) return;

    const checklist: DiagnosticsChecklist = {
      screenTouch: true,
      displayArtifacts: false,
      frontCamera: true,
      backCamera: true,
      faceIdBiometrics: true,
      earpieceSpeaker: true,
      loudspeaker: true,
      microphone: true,
      chargingPort: true,
      wirelessBluetooth: true,
      physicalButtons: true,
      waterDamageIndicator: false
    };

    const newTicket = createRepairTicket({
      customerId: selectedCustomer?.id || `CUST-WALK-${Date.now()}`,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      deviceBrand: brand,
      deviceModel: model,
      imeiOrSerial: imei,
      deviceColor: color || 'Black',
      passcodeOrPin: passcode,
      cosmeticConditionNotes: cosmeticNotes || 'Normal shop wear and tear',
      reportedIssues: selectedIssues.length > 0 ? selectedIssues : ['General Hardware Diagnosis'],
      diagnosticsChecklist: checklist,
      estimatedCost,
      depositPaid: deposit,
      assignedTechnician: technician,
      priority,
      status: 'RECEIVED',
      warrantyPeriod: '90 Days Store Labor & Screen Warranty',
      partsUsed: [],
      laborCharge: Math.max(0, estimatedCost - deposit),
      customerFacingNotes: 'Thank you for choosing us for your device repair.',
      internalTechNotes: ''
    });

    setIsIntakeModalOpen(false);
    // Reset form
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setSelectedCustomer(null);
    setModel('');
    setImei('');
    setColor('');
    setPasscode('');
    setSelectedIssues([]);
    setCosmeticNotes('');

    setActiveJobSheetModal(newTicket);
  };

  const handleAllocatePart = () => {
    if (!selectedTicket || !selectedPartId || selectedPartQty <= 0) return;
    const success = allocatePartToRepair(selectedTicket.id, selectedPartId, selectedPartQty);
    if (success) {
      const updated = repairTickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
      setSelectedPartId('');
      setSelectedPartQty(1);
    }
  };

  const handleAddTechNote = () => {
    if (!selectedTicket || !techNoteText.trim()) return;
    changeRepairStatus(selectedTicket.id, selectedTicket.status, techNoteText.trim());
    setTechNoteText('');
    const updated = repairTickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#FAF8F5] dark:bg-[#080E1A]">
      {/* Top Overview & Action Strip */}
      <div className="p-3 sm:p-4 border-b border-[#E8E3D7] dark:border-[#182744] bg-white dark:bg-[#0A1221] flex flex-wrap items-center justify-between gap-3 sm:gap-4 shrink-0">
        {/* KPI metrics in 1 clean row */}
        <div className="overflow-x-auto max-w-full pb-0.5 scrollbar-none">
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
            <div>
              <span>Bench Queue: </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                {activeCount}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <div>
              <span>Waiting for Parts: </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums text-sm">
                {waitingPartsCount}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <div>
              <span>Ready for Customer: </span>
              <span className="font-mono font-bold text-teal-700 dark:text-teal-400 tabular-nums text-sm">
                {readyPickupCount}
              </span>
            </div>
          </div>
        </div>

        {/* View mode & Search controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket #, customer, IMEI..."
              className="w-full sm:w-60 pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <div className="inline-flex rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#F5F2EB] dark:bg-[#0F1A2E] p-0.5 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsIntakeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ticket (F3)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Kanban or Table */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-5">
        {viewMode === 'kanban' ? (
          <div className="flex gap-4 h-full min-w-max pb-2">
            {statusColumns.map(col => {
              const colTickets = filteredTickets.filter(t => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="w-80 flex flex-col bg-[#F5F2EB]/80 dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] h-full shadow-2xs"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#E8E3D7] dark:border-[#182744] bg-white dark:bg-[#0F1A2E] rounded-t-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <span>{col.label}</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-[#FAF8F5] dark:bg-[#14223D] px-2 py-0.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52]">
                      {colTickets.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {colTickets.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400 italic">
                        No tickets in this stage
                      </div>
                    ) : (
                      colTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-3 bg-white dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] hover:border-teal-600/60 dark:hover:border-teal-500/60 cursor-pointer transition-all text-xs shadow-2xs space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="font-mono font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                                {ticket.ticketNumber}
                              </span>
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors text-xs sm:text-sm">
                                {ticket.deviceBrand} {ticket.deviceModel}
                              </div>
                            </div>
                            {ticket.priority === 'Urgent' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800">
                                Urgent
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div>Client: <span className="font-medium text-slate-800 dark:text-slate-200">{ticket.customerName}</span></div>
                            <div className="font-mono text-[11px] text-slate-400">IMEI: {ticket.imeiOrSerial}</div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {ticket.reportedIssues.slice(0, 2).map((issue, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-[#FAF8F5] dark:bg-[#14223D] text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] truncate max-w-[190px]"
                              >
                                {issue}
                              </span>
                            ))}
                            {ticket.reportedIssues.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">+{ticket.reportedIssues.length - 2}</span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#F5F2EB] dark:border-[#182744] flex items-center justify-between text-xs">
                            <span className="text-slate-500 text-[11px] truncate max-w-[130px]">
                              {ticket.assignedTechnician.split(' ')[0]}
                            </span>
                            <span className="font-mono font-bold text-teal-800 dark:text-teal-300 text-xs sm:text-sm tabular-nums">
                              {storeSettings.currencySymbol}{ticket.finalCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table High-Density View */
          <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left min-w-[920px] border-collapse">
              <thead className="bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>Ticket #</th>
                  <th className="px-4">Device & IMEI</th>
                  <th className="px-4">Customer</th>
                  <th className="px-4">Faults</th>
                  <th className="px-4">Technician</th>
                  <th className="px-4">Status</th>
                  <th className="px-4 text-right">Quote</th>
                  <th className="px-4 text-center">Intake Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
                {filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] cursor-pointer transition-colors"
                  >
                    <td className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'} font-mono font-bold text-slate-800 dark:text-slate-200`}>
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">IMEI: {ticket.imeiOrSerial}</div>
                    </td>
                    <td className="px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{ticket.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{ticket.customerPhone}</div>
                    </td>
                    <td className="px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {ticket.reportedIssues.join(' · ')}
                    </td>
                    <td className="px-4 text-slate-500">{ticket.assignedTechnician}</td>
                    <td className="px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F5F2EB] dark:bg-[#14223D] text-slate-700 dark:text-slate-300 border border-[#E8E3D7] dark:border-[#1C2E52]">
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 text-right font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                      {storeSettings.currencySymbol}{ticket.finalCost.toFixed(2)}
                    </td>
                    <td className="px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveJobSheetModal(ticket);
                        }}
                        className="p-1.5 hover:bg-[#F5F2EB] dark:hover:bg-[#14223D] rounded text-slate-500 hover:text-teal-700"
                        title="Print Intake Slip"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DRAWER: Selected Ticket Details & Parts Workbench */}
      {selectedTicket && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-[#0A1221] shadow-2xl border-l border-[#E8E3D7] dark:border-[#182744] flex flex-col justify-between overflow-hidden text-xs">
          <div className="p-4 border-b border-[#E8E3D7] dark:border-[#182744] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#0F1A2E]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {selectedTicket.ticketNumber}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80">
                  {selectedTicket.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {selectedTicket.deviceBrand} {selectedTicket.deviceModel} · IMEI: {selectedTicket.imeiOrSerial}
              </p>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Status Changer */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Advance Stage Status
              </label>
              <select
                value={selectedTicket.status}
                onChange={(e) => {
                  const newStatus = e.target.value as RepairStatus;
                  changeRepairStatus(selectedTicket.id, newStatus);
                  setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
                }}
                className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-semibold text-slate-900 dark:text-slate-100"
              >
                {statusColumns.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Client & Device Details */}
            <div className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedTicket.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-medium">{selectedTicket.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PIN / Passcode:</span>
                <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{selectedTicket.passcodeOrPin || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Technician:</span>
                <span>{selectedTicket.assignedTechnician}</span>
              </div>
            </div>

            {/* Allocate Spare Part */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Allocate Spare Part to Job
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-xs"
                >
                  <option value="">Select inventory part...</option>
                  {spareParts.filter(p => p.stockQty > 0).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({storeSettings.currencySymbol}{p.sellingPrice.toFixed(2)} - {p.stockQty} in stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={selectedPartQty}
                  onChange={(e) => setSelectedPartQty(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-center text-xs"
                />
                <button
                  onClick={handleAllocatePart}
                  disabled={!selectedPartId}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-md font-semibold text-xs"
                >
                  Add Part
                </button>
              </div>

              {selectedTicket.partsUsed.length > 0 && (
                <div className="space-y-1 pt-1">
                  {selectedTicket.partsUsed.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-xs">
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{p.partName}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">x{p.quantity}</span>
                      </div>
                      <span className="font-mono font-semibold text-teal-800 dark:text-teal-300">
                        {storeSettings.currencySymbol}{(p.unitPrice * p.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Total Quote / Bill:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{storeSettings.currencySymbol}{selectedTicket.finalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Deposit Paid:</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">-{storeSettings.currencySymbol}{selectedTicket.depositPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-[#E8E3D7] dark:border-[#182744]">
                <span>Balance to Collect on Pickup:</span>
                <span className="font-mono text-teal-800 dark:text-teal-300">
                  {storeSettings.currencySymbol}{Math.max(0, selectedTicket.finalCost - selectedTicket.depositPaid).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Technician Notes & Work Log */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Technician Work Log
              </label>
              <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-xs font-mono text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {selectedTicket.internalTechNotes || 'No technician logs logged.'}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techNoteText}
                  onChange={(e) => setTechNoteText(e.target.value)}
                  placeholder="Append bench note..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs"
                />
                <button
                  onClick={handleAddTechNote}
                  className="px-3 py-1.5 bg-[#F5F2EB] dark:bg-[#14223D] hover:bg-[#EAE5D9] rounded-md font-semibold text-slate-800 dark:text-slate-200 text-xs shrink-0"
                >
                  Log
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0F1A2E] flex justify-between items-center shrink-0">
            <span className="text-[11px] text-slate-500">
              Warranty: {selectedTicket.warrantyPeriod}
            </span>
            <button
              onClick={() => {
                changeRepairStatus(selectedTicket.id, 'READY_FOR_PICKUP');
                setSelectedTicket(prev => prev ? { ...prev, status: 'READY_FOR_PICKUP' } : null);
              }}
              className="px-4 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs"
            >
              Mark Ready for Pickup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: New Repair Ticket Intake Form */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-2xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden text-xs">
            {/* Header */}
            <div className="p-4 border-b border-[#E8E3D7] dark:border-[#182744] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  New Device Repair Intake (Work Order)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admit customer phone to service queue and generate printable intake slip.
                </p>
              </div>
              <button
                onClick={() => setIsIntakeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateIntake} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Customer Contact */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    1. Customer Contact & Ownership
                  </span>
                  {selectedCustomer && (
                    <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Existing Account Linked</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                    Quick Search Existing Customer:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={existingCustomerSearch}
                      onChange={(e) => setExistingCustomerSearch(e.target.value)}
                      placeholder="Type customer phone or name to auto-fill..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>

                  {matchingCustomers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-[#F5F2EB] dark:divide-[#182744]">
                      {matchingCustomers.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectExistingCustomer(c)}
                          className="p-2.5 hover:bg-[#FAF8F5] dark:hover:bg-[#14223D] cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{c.phone} · Spend: {storeSettings.currencySymbol}{c.totalSpent.toFixed(2)}</div>
                          </div>
                          <span className="text-[11px] text-teal-600 font-medium">Select →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Jason Brooks"
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="+1 (555) 302-9182"
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="jason@work.com"
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Device Identification */}
              <div className="space-y-3 pt-3 border-t border-[#E8E3D7] dark:border-[#182744]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  2. Device Information & Unlock Passcode
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Brand</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Google">Google</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Motorola">Motorola</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Model Name *</label>
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. iPhone 15 Pro"
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">15-Digit IMEI *</label>
                    <input
                      type="text"
                      required
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      placeholder="354891108294012"
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">PIN / Passcode</label>
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="4920"
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Reported Issues */}
              <div className="space-y-3 pt-3 border-t border-[#E8E3D7] dark:border-[#182744]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  3. Client Reported Faults
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {commonIssues.map((issue, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`p-2 rounded-md text-left border transition-all text-xs ${
                        selectedIssues.includes(issue)
                          ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-600 dark:border-teal-600 font-semibold shadow-2xs'
                          : 'bg-[#FAF8F5] dark:bg-[#0F1A2E] border-[#E8E3D7] dark:border-[#1C2E52] text-slate-700 dark:text-slate-300 hover:bg-[#F5F2EB]'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Condition */}
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Cosmetic Condition at Intake
                </label>
                <input
                  type="text"
                  value={cosmeticNotes}
                  onChange={(e) => setCosmeticNotes(e.target.value)}
                  placeholder="e.g. Scratches on rail, screen shattered, camera lens intact"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Estimates & Tech */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E8E3D7] dark:border-[#182744]">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Quote ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Deposit ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Tech Assigned</label>
                  <select
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="Alex Rivera (Lead Micro-Tech)">Alex Rivera (Micro-Tech)</option>
                    <option value="Samir Patel (Hardware Tech)">Samir Patel (Hardware Tech)</option>
                    <option value="Marcus Vance (Bench Lead)">Marcus Vance (Bench Lead)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RepairPriority)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent / Express</option>
                    <option value="Warranty Claim">Warranty Claim</option>
                  </select>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#E8E3D7] dark:border-[#182744] flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#0A1221] py-3 z-20">
                <button
                  type="button"
                  onClick={() => setIsIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 hover:bg-[#FAF8F5] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold flex items-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Admit Device & Print Job Sheet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
