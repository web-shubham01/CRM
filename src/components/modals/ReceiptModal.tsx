import React, { useState } from 'react';
import { Printer, X, Check, Copy } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ReceiptModal: React.FC = () => {
  const { activeInvoiceModal, setActiveInvoiceModal, storeSettings } = useStore();
  const [format, setFormat] = useState<'thermal' | 'a4'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!activeInvoiceModal) return null;

  const invoice = activeInvoiceModal;

  const handlePrint = () => {
    window.print();
  };

  const copyInvoiceText = () => {
    const text = `Invoice #${invoice.invoiceNumber}\nDate: ${new Date(invoice.createdAt).toLocaleString()}\nCustomer: ${invoice.customerName} (${invoice.customerPhone})\nTotal: ${storeSettings.currencySymbol}${invoice.grandTotal.toFixed(2)}\nPayment: ${invoice.paymentMethod} (${invoice.paymentStatus})\nStore: ${storeSettings.storeName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Controls Header */}
        <div className="no-print px-4 sm:px-5 py-3 border-b border-[#E8E3D7] dark:border-[#182744] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format:</span>
            <div className="inline-flex rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-white dark:bg-[#0A1221] p-0.5 text-xs">
              <button
                onClick={() => setFormat('thermal')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  format === 'thermal'
                    ? 'bg-teal-700 text-white dark:bg-teal-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                onClick={() => setFormat('a4')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  format === 'a4'
                    ? 'bg-teal-700 text-white dark:bg-teal-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Standard (A4)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyInvoiceText}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0A1221] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md hover:bg-[#FAF8F5] flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setActiveInvoiceModal(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F2EB]/60 dark:bg-[#080E1A] flex justify-center">
          {format === 'thermal' ? (
            /* 80mm ESC/POS Receipt View */
            <div className="print-container w-[320px] sm:w-[340px] bg-white text-black p-5 shadow-2xs border border-[#E8E3D7] font-mono text-xs leading-tight select-text">
              <div className="text-center pb-3 border-b border-dashed border-black/40 space-y-1">
                <div className="text-base font-bold tracking-tight font-sans uppercase">
                  {storeSettings.storeName}
                </div>
                <div className="text-[11px]">{storeSettings.tagline}</div>
                <div className="text-[10px] text-gray-700">{storeSettings.addressLine1}</div>
                <div className="text-[10px] text-gray-700">{storeSettings.addressLine2}</div>
                <div className="text-[10px]">Tel: {storeSettings.phone}</div>
                <div className="text-[10px]">Tax ID: {storeSettings.taxNumber}</div>
              </div>

              <div className="py-2.5 border-b border-dashed border-black/40 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>INVOICE:</span>
                  <span className="font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENT:</span>
                  <span className="font-sans font-semibold">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{invoice.customerPhone}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3 border-b border-dashed border-black/40 space-y-2">
                <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-black/20">
                  <span>DESCRIPTION</span>
                  <span>AMOUNT</span>
                </div>
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="font-sans font-medium">{item.quantity}x {item.name}</span>
                      <span className="font-bold">{storeSettings.currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-gray-600">
                      {item.skuOrImei}
                    </div>
                    {item.warrantyInfo && (
                      <div className="text-[10px] text-gray-500 italic">
                        Warranty: {item.warrantyInfo}
                      </div>
                    )}
                  </div>
                ))}

                {invoice.tradeInCredit && (
                  <div className="pt-1.5 border-t border-dashed border-black/20 flex justify-between text-[11px] font-bold">
                    <span>LESS TRADE-IN CREDIT ({invoice.tradeInCredit.model}):</span>
                    <span>-{storeSettings.currencySymbol}{invoice.tradeInCredit.agreedPayoutValue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-black/40 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{storeSettings.currencySymbol}{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>DISCOUNT APPLIED:</span>
                    <span>-{storeSettings.currencySymbol}{invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>SALES TAX ({storeSettings.defaultTaxRate}%):</span>
                  <span>{storeSettings.currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-black/40">
                  <span>TOTAL PAID:</span>
                  <span>{storeSettings.currencySymbol}{invoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="py-2.5 border-b border-dashed border-black/40 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>METHOD:</span>
                  <span>{invoice.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="font-bold">{invoice.paymentStatus}</span>
                </div>
                {invoice.paymentMethod === 'Cash' && (
                  <div className="flex justify-between">
                    <span>CASH TENDERED:</span>
                    <span>{storeSettings.currencySymbol}{invoice.amountPaid.toFixed(2)}</span>
                  </div>
                )}
                {invoice.paymentMethod === 'Cash' && (
                  <div className="flex justify-between font-bold">
                    <span>CHANGE RETURNED:</span>
                    <span>{storeSettings.currencySymbol}{Math.max(0, invoice.amountPaid - invoice.grandTotal).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Policy Footer */}
              <div className="pt-4 text-center space-y-1.5 text-[10px] text-gray-700">
                <p className="font-semibold">{storeSettings.salesReturnPolicy}</p>
                <p className="pt-1 text-gray-500 font-sans font-medium text-[11px]">Thank you for supporting your local phone store!</p>
                <div className="pt-1 font-mono tracking-widest text-[9px]">*** CUSTOMER COPY ***</div>
              </div>
            </div>
          ) : (
            /* Standard A4 Formal Invoice Layout */
            <div className="print-container w-full max-w-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xs border border-[#E8E3D7] text-xs leading-normal select-text">
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase font-sans">
                    {storeSettings.storeName}
                  </h2>
                  <div className="text-xs text-slate-600 mt-0.5">{storeSettings.tagline}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {storeSettings.addressLine1}, {storeSettings.addressLine2}
                  </div>
                  <div className="text-[11px] text-slate-500">Phone: {storeSettings.phone} · Email: {storeSettings.email}</div>
                  <div className="text-[11px] text-slate-500">VAT/Tax ID: {storeSettings.taxNumber}</div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-400">TAX INVOICE</span>
                  <div className="text-lg font-mono font-bold text-slate-900 leading-tight">{invoice.invoiceNumber}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Date: {new Date(invoice.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    Payment: <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To</span>
                  <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
                  <div className="text-slate-600 font-mono text-xs">{invoice.customerPhone}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Invoice Status</span>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-4 border-b border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                      <th className="py-2">Item Description & Serial / IMEI</th>
                      <th className="py-2 text-center w-16">Qty</th>
                      <th className="py-2 text-right w-24">Unit Price</th>
                      <th className="py-2 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-900">{it.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{it.skuOrImei}</div>
                          {it.warrantyInfo && <div className="text-[10px] text-slate-400">Coverage: {it.warrantyInfo}</div>}
                        </td>
                        <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                        <td className="py-2.5 text-right font-mono">{storeSettings.currencySymbol}{it.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                          {storeSettings.currencySymbol}{(it.quantity * it.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {invoice.tradeInCredit && (
                      <tr className="bg-teal-50/50">
                        <td colSpan={3} className="py-2 text-teal-800 font-medium">
                          Trade-In Device Credit: {invoice.tradeInCredit.brand} {invoice.tradeInCredit.model} (IMEI: {invoice.tradeInCredit.imei})
                        </td>
                        <td className="py-2 text-right font-mono font-bold text-teal-800">
                          -{storeSettings.currencySymbol}{invoice.tradeInCredit.agreedPayoutValue.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Numerical Totals */}
              <div className="py-4 border-b border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{storeSettings.currencySymbol}{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-mono">-{storeSettings.currencySymbol}{invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Sales Tax ({storeSettings.defaultTaxRate}%):</span>
                    <span className="font-mono">{storeSettings.currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base">{storeSettings.currencySymbol}{invoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Terms Footer */}
              <div className="pt-6 text-slate-500 text-[11px] space-y-1">
                <div className="font-bold text-slate-700">Terms & Conditions:</div>
                <p>{storeSettings.salesReturnPolicy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
