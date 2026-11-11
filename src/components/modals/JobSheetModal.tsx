import React from 'react';
import { Printer, X, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const JobSheetModal: React.FC = () => {
  const { activeJobSheetModal, setActiveJobSheetModal, storeSettings } = useStore();

  if (!activeJobSheetModal) return null;

  const ticket = activeJobSheetModal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Controls Header */}
        <div className="no-print px-4 sm:px-5 py-3 border-b border-[#E8E3D7] dark:border-[#182744] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Work Order Intake Slip: <span className="font-mono">{ticket.ticketNumber}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Intake Slip</span>
            </button>
            <button
              onClick={() => setActiveJobSheetModal(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F2EB]/60 dark:bg-[#080E1A] flex justify-center">
          <div className="print-container w-full max-w-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xs border border-[#E8E3D7] text-xs leading-normal select-text">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  {storeSettings.storeName}
                </h2>
                <div className="text-[11px] text-slate-600">{storeSettings.tagline}</div>
                <div className="text-[10px] text-slate-500">{storeSettings.addressLine1} · Tel: {storeSettings.phone}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">REPAIR WORK ORDER</span>
                <div className="text-xl font-mono font-bold text-slate-900 leading-tight">{ticket.ticketNumber}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Received: {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[11px] font-semibold text-slate-700">Tech: {ticket.assignedTechnician}</div>
              </div>
            </div>

            {/* Customer & Device Dual Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200">
              <div className="bg-[#FAF8F5] p-3 rounded-md border border-[#E8E3D7]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customer Details</span>
                <div className="font-semibold text-slate-900 text-sm">{ticket.customerName}</div>
                <div className="text-slate-700 font-mono mt-0.5">{ticket.customerPhone}</div>
                {ticket.customerEmail && <div className="text-slate-500 text-[11px] truncate">{ticket.customerEmail}</div>}
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-md border border-[#E8E3D7]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Device Under Repair</span>
                <div className="font-semibold text-slate-900 text-sm">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </div>
                <div className="text-slate-600 text-[11px]">
                  Color: <span className="font-medium text-slate-800">{ticket.deviceColor}</span>
                </div>
                <div className="text-slate-700 font-mono text-[11px]">
                  IMEI / SN: <span className="font-semibold">{ticket.imeiOrSerial}</span>
                </div>
                <div className="text-slate-700 text-[11px] mt-0.5 flex items-center gap-2">
                  <span>Passcode / PIN:</span>
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 border border-slate-300 rounded text-slate-900">
                    {ticket.passcodeOrPin || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reported Problems & Intake Inspection */}
            <div className="py-4 border-b border-slate-200 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Client Reported Issues</span>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.reportedIssues.map((issue, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#F5F2EB] border border-[#E8E3D7] rounded text-slate-800 font-medium text-[11px]">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Physical / Cosmetic Condition at Intake</span>
                <div className="p-2 bg-[#FAF8F5] border border-[#E8E3D7] rounded text-[11px] text-slate-700">
                  {ticket.cosmeticConditionNotes || 'No specific cosmetic flaws noted at counter check.'}
                </div>
              </div>
            </div>

            {/* Diagnostics Matrix */}
            <div className="py-4 border-b border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Pre-Repair Checklist</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                {Object.entries(ticket.diagnosticsChecklist).map(([key, passed]) => {
                  const formatKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="flex items-center justify-between p-1.5 border border-[#E8E3D7] bg-[#FAF8F5] rounded">
                      <span className="text-slate-600 truncate">{formatKey}</span>
                      <span className={`font-mono font-bold ${passed ? 'text-teal-700' : 'text-rose-600'}`}>
                        {passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financials & Balance */}
            <div className="py-4 border-b border-slate-200 flex justify-between items-center bg-[#FAF8F5] p-3 rounded-md border border-[#E8E3D7]">
              <div>
                <div className="text-[11px] text-slate-500">Estimated Total Quote</div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {storeSettings.currencySymbol}{ticket.estimatedCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Deposit Received</div>
                <div className="text-base font-bold text-teal-700 font-mono">
                  {storeSettings.currencySymbol}{ticket.depositPaid.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Estimated Balance on Delivery</div>
                <div className="text-lg font-bold text-teal-800 font-mono">
                  {storeSettings.currencySymbol}{Math.max(0, ticket.estimatedCost - ticket.depositPaid).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Legal Disclaimers & Customer Signature */}
            <div className="pt-4 space-y-4">
              <div className="p-2.5 border border-amber-200 bg-amber-50/50 rounded text-[10px] text-amber-950 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <p className="leading-tight">
                  Customer acknowledges responsibility for data backups prior to bench service. {storeSettings.storeName} is not liable for data loss during micro-soldering, board rework, or OS updates. Unclaimed items after 45 days of completion are subject to recycling or disposal fees.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                  <div className="border-b border-slate-300 pb-8"></div>
                  <div className="text-[10px] text-slate-500 text-center mt-1">Customer Signature & Consent</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-8"></div>
                  <div className="text-[10px] text-slate-500 text-center mt-1">Intake Technician Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
