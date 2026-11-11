import React, { useState, useMemo } from 'react';
import { Search, X, Smartphone, Wrench, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ImeiLookupModal: React.FC = () => {
  const { 
    isImeiLookupOpen, 
    setIsImeiLookupOpen, 
    devices, 
    repairTickets, 
    salesInvoices, 
    customers,
    setActiveJobSheetModal,
    setActiveInvoiceModal,
    storeSettings
  } = useStore();

  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmedQuery || trimmedQuery.length < 3) {
      return { devices: [], repairs: [], invoices: [], customers: [] };
    }

    const matchedDevices = devices.filter(d => 
      d.imei1.toLowerCase().includes(trimmedQuery) ||
      (d.imei2 && d.imei2.toLowerCase().includes(trimmedQuery)) ||
      d.model.toLowerCase().includes(trimmedQuery) ||
      d.sku.toLowerCase().includes(trimmedQuery)
    );

    const matchedRepairs = repairTickets.filter(r => 
      r.imeiOrSerial.toLowerCase().includes(trimmedQuery) ||
      r.ticketNumber.toLowerCase().includes(trimmedQuery) ||
      r.customerPhone.toLowerCase().includes(trimmedQuery) ||
      r.customerName.toLowerCase().includes(trimmedQuery)
    );

    const matchedInvoices = salesInvoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(trimmedQuery) ||
      inv.customerPhone.toLowerCase().includes(trimmedQuery) ||
      inv.customerName.toLowerCase().includes(trimmedQuery) ||
      inv.items.some(it => it.skuOrImei.toLowerCase().includes(trimmedQuery))
    );

    const matchedCustomers = customers.filter(c => 
      c.phone.toLowerCase().includes(trimmedQuery) ||
      c.name.toLowerCase().includes(trimmedQuery) ||
      c.associatedImeis.some(im => im.toLowerCase().includes(trimmedQuery))
    );

    return {
      devices: matchedDevices,
      repairs: matchedRepairs,
      invoices: matchedInvoices,
      customers: matchedCustomers
    };
  }, [trimmedQuery, devices, repairTickets, salesInvoices, customers]);

  if (!isImeiLookupOpen) return null;

  const totalResults = results.devices.length + results.repairs.length + results.invoices.length + results.customers.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-2xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden text-xs">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E8E3D7] dark:border-[#182744] flex items-center gap-3 bg-[#FAF8F5] dark:bg-[#0F1A2E]">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Scan barcode, enter 15-digit IMEI, Phone #, or Ticket ID..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsImeiLookupOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!trimmedQuery || trimmedQuery.length < 3 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Smartphone className="w-7 h-7 mx-auto mb-2 opacity-40 text-slate-500" />
              <p>Type at least 3 digits of an IMEI, Ticket #, Customer Phone, or Serial.</p>
              <p className="mt-1 text-[11px] text-slate-500">Quick test: try "3548", "WO-841", or "555"</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No store records found matching "<span className="font-mono">{query}</span>".
            </div>
          ) : (
            <>
              {/* Devices Match */}
              {results.devices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Inventory Phones ({results.devices.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.devices.map(device => (
                      <div
                        key={device.id}
                        className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{device.brand} {device.model} ({device.storage})</span>
                            <span className="text-[11px] font-normal text-slate-500">· {device.condition}</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">
                            IMEI: <span className="font-bold text-slate-700 dark:text-slate-300">{device.imei1}</span>
                            {device.batteryHealth && <span> · Battery: {device.batteryHealth}%</span>}
                            <span> · {device.carrierStatus}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-teal-800 dark:text-teal-300">
                            {storeSettings.currencySymbol}{device.sellingPrice.toFixed(2)}
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            device.status === 'In Stock' 
                              ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {device.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repair Tickets Match */}
              {results.repairs.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-teal-600" />
                    <span>Repair Tickets ({results.repairs.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.repairs.map(ticket => (
                      <div
                        key={ticket.id}
                        className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="font-mono text-slate-700 dark:text-slate-300">{ticket.ticketNumber}</span>
                            <span>·</span>
                            <span>{ticket.deviceBrand} {ticket.deviceModel}</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            Customer: {ticket.customerName} ({ticket.customerPhone}) · IMEI: <span className="font-mono">{ticket.imeiOrSerial}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-[#F5F2EB] dark:bg-[#14223D] text-slate-700 dark:text-slate-300 rounded border border-[#E8E3D7] dark:border-[#1C2E52]">
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                          <button
                            onClick={() => {
                              setIsImeiLookupOpen(false);
                              setActiveJobSheetModal(ticket);
                            }}
                            className="p-1 text-slate-500 hover:text-teal-700"
                            title="View Job Sheet"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Match */}
              {results.invoices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-teal-600" />
                    <span>Past Sales Invoices ({results.invoices.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.invoices.map(inv => (
                      <div
                        key={inv.id}
                        className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="font-mono">{inv.invoiceNumber}</span>
                            <span>·</span>
                            <span>{inv.customerName}</span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {new Date(inv.createdAt).toLocaleDateString()} · {inv.paymentMethod} · {inv.items.length} items
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                            {storeSettings.currencySymbol}{inv.grandTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setIsImeiLookupOpen(false);
                              setActiveInvoiceModal(inv);
                            }}
                            className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0F1A2E] text-[11px] text-slate-500 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Search covers live inventory, repair logs, invoices, and customer accounts.</span>
          </div>
          <span className="font-mono text-slate-400">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
