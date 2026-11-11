import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  RotateCcw, 
  Download
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SalesInvoice } from '../../types';

export const SalesLedger: React.FC = () => {
  const { 
    salesInvoices, 
    refundInvoice, 
    setActiveInvoiceModal, 
    storeSettings,
    isCompactDensity 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState<SalesInvoice | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Filtering
  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter(inv => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.includes(q) ||
        inv.items.some(it => it.skuOrImei.toLowerCase().includes(q) || it.name.toLowerCase().includes(q));

      const matchMethod = methodFilter === 'ALL' || inv.paymentMethod === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [salesInvoices, searchQuery, methodFilter]);

  // Aggregate Totals
  const totalRevenue = useMemo(() => {
    return salesInvoices
      .filter(i => i.paymentStatus === 'PAID')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }, [salesInvoices]);

  const totalTax = useMemo(() => {
    return salesInvoices
      .filter(i => i.paymentStatus === 'PAID')
      .reduce((sum, i) => sum + i.taxAmount, 0);
  }, [salesInvoices]);

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForRefund || !refundReason.trim()) return;

    refundInvoice(selectedInvoiceForRefund.id, refundReason.trim());
    setSelectedInvoiceForRefund(null);
    setRefundReason('');
  };

  const exportInvoicesCsv = () => {
    let csv = 'InvoiceNumber,Date,Customer,Phone,ItemsCount,Subtotal,Discount,Tax,GrandTotal,PaymentMethod,PaymentStatus\n';
    filteredInvoices.forEach(i => {
      csv += `"${i.invoiceNumber}","${i.createdAt}","${i.customerName}","${i.customerPhone}",${i.items.length},${i.subtotal},${i.discount},${i.taxAmount},${i.grandTotal},"${i.paymentMethod}","${i.paymentStatus}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sales_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#FAF8F5] dark:bg-[#080E1A]">
      {/* Top Ledger Strip */}
      <div className="p-3 sm:p-4 border-b border-[#E8E3D7] dark:border-[#182744] bg-white dark:bg-[#0A1221] flex flex-wrap items-center justify-between gap-3 sm:gap-4 shrink-0">
        <div className="overflow-x-auto max-w-full pb-0.5 scrollbar-none">
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
            <div>
              <span>Revenue: </span>
              <span className="font-mono font-bold text-teal-800 dark:text-teal-300 tabular-nums text-sm">
                {storeSettings.currencySymbol}{totalRevenue.toFixed(2)}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <div>
              <span>Tax Collected: </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums text-sm">
                {storeSettings.currencySymbol}{totalTax.toFixed(2)}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <div>
              <span>Receipts Logged: </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums text-sm">
                {salesInvoices.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter invoice #, customer, IMEI..."
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-700 dark:text-slate-300 shrink-0"
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Credit/Debit Card">Card</option>
            <option value="Bank Transfer / UPI">UPI / Transfer</option>
          </select>

          <button
            onClick={exportInvoicesCsv}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md bg-white dark:bg-[#0F1A2E] hover:bg-[#FAF8F5] transition-colors shrink-0"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-5">
        <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] overflow-x-auto shadow-2xs">
          <table className="w-full text-xs text-left min-w-[920px] border-collapse">
            <thead className="bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>Invoice #</th>
                <th className="px-4">Date & Time</th>
                <th className="px-4">Customer</th>
                <th className="px-4">Items Summary</th>
                <th className="px-4">Payment Method</th>
                <th className="px-4 text-right">Tax</th>
                <th className="px-4 text-right">Grand Total</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] transition-colors">
                  <td className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'} font-mono font-bold text-slate-900 dark:text-white`}>
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{invoice.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{invoice.customerPhone}</div>
                  </td>
                  <td className="px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                    {invoice.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    {invoice.tradeInCredit && (
                      <span className="text-teal-700 dark:text-teal-400 ml-1">
                        (Trade-in: {invoice.tradeInCredit.model})
                      </span>
                    )}
                  </td>
                  <td className="px-4 font-medium text-slate-700 dark:text-slate-300">
                    {invoice.paymentMethod}
                  </td>
                  <td className="px-4 text-right font-mono text-slate-500 tabular-nums">
                    {storeSettings.currencySymbol}{invoice.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-4 text-right font-mono font-bold text-teal-800 dark:text-teal-300 tabular-nums text-xs sm:text-sm">
                    {storeSettings.currencySymbol}{invoice.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-4">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      invoice.paymentStatus === 'PAID'
                        ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setActiveInvoiceModal(invoice)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 dark:hover:text-teal-300 rounded hover:bg-[#FAF8F5]"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {invoice.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => setSelectedInvoiceForRefund(invoice)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Issue Refund"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Refund Confirmation */}
      {selectedInvoiceForRefund && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-md p-5 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Process Invoice Refund: {selectedInvoiceForRefund.invoiceNumber}
            </h3>
            <p className="text-slate-500 mb-3 text-[11px]">
              Customer: {selectedInvoiceForRefund.customerName} · Amount: {storeSettings.currencySymbol}{selectedInvoiceForRefund.grandTotal.toFixed(2)}
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Refund Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Defective cable returned within 48h, customer requested cash back."
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForRefund(null)}
                  className="px-3 py-1.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Confirm & Mark Refunded
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
