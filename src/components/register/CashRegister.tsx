import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CashRegister: React.FC = () => {
  const { 
    registerShift, 
    addRegisterPayout, 
    closeRegisterShift, 
    openNewRegisterShift, 
    storeSettings 
  } = useStore();

  // Payout form
  const [payoutReason, setPayoutReason] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(10);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Close shift count calculator
  const [c100, setC100] = useState(0);
  const [c50, setC50] = useState(0);
  const [c20, setC20] = useState(0);
  const [c10, setC10] = useState(0);
  const [c5, setC5] = useState(0);
  const [c1, setC1] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Open new shift form
  const [newOpeningCash, setNewOpeningCash] = useState(350);
  const [openedByStaff, setOpenedByStaff] = useState('Marcus Vance (Shift Lead)');

  const totalPayouts = registerShift.payouts.reduce((sum, p) => sum + p.amount, 0);
  const expectedCashInDrawer = registerShift.openingCash + registerShift.cashSales - totalPayouts;

  const countedCashTotal = (c100 * 100) + (c50 * 50) + (c20 * 20) + (c10 * 10) + (c5 * 5) + (c1 * 1) + coins;
  const closingVariance = Number((countedCashTotal - expectedCashInDrawer).toFixed(2));

  const handleAddPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutReason || payoutAmount <= 0) return;

    addRegisterPayout(payoutReason, payoutAmount);
    setIsPayoutModalOpen(false);
    setPayoutReason('');
    setPayoutAmount(10);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeRegisterShift(countedCashTotal, 'End of business day drawer balancing.');
    setIsClosingModalOpen(false);
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openNewRegisterShift(newOpeningCash, openedByStaff);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#FAF8F5] dark:bg-[#080E1A] p-4 sm:p-6 select-none">
      <div className="max-w-4xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Cash Drawer Balancing & Day-End Z-Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Shift opened {new Date(registerShift.openedAt).toLocaleDateString()} at {new Date(registerShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {registerShift.openedBy}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {registerShift.isOpen ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 rounded-md text-xs font-semibold">
                <Unlock className="w-3.5 h-3.5" />
                <span>Shift Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F2EB] text-slate-700 dark:bg-[#14223D] dark:text-slate-300 rounded-md text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Shift Closed</span>
              </span>
            )}
          </div>
        </div>

        {/* Financial Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Opening Float</span>
            <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {storeSettings.currencySymbol}{registerShift.openingCash.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">Starting cash float</span>
          </div>

          <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Cash Sales In</span>
            <div className="text-base sm:text-lg font-mono font-bold text-teal-700 dark:text-teal-400 mt-1 tabular-nums">
              +{storeSettings.currencySymbol}{registerShift.cashSales.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">Reconciled with Sales Ledger</span>
          </div>

          <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Card & UPI Volume</span>
            <div className="text-base sm:text-lg font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
              {storeSettings.currencySymbol}{(registerShift.cardSales + registerShift.transferSales).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">Terminal settlements</span>
          </div>

          <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Drawer Cash</span>
            <div className="text-base sm:text-lg font-mono font-bold text-teal-800 dark:text-teal-300 mt-1 tabular-nums">
              {storeSettings.currencySymbol}{expectedCashInDrawer.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400">Float + Cash Sales - Payouts</span>
          </div>
        </div>

        {/* Register Action Buttons */}
        {registerShift.isOpen ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="px-4 py-2 bg-white dark:bg-[#0A1221] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>Record Cash Payout / Drop</span>
            </button>
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Count Drawer & Close Shift (Z-Report)</span>
            </button>
          </div>
        ) : (
          <div className="p-5 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-600 font-semibold">
              <Lock className="w-4 h-4" />
              <span>Shift Closed. Open a new register shift to begin counter sales.</span>
            </div>
            <form onSubmit={handleOpenShift} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-lg">
              <div className="flex-1">
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Opening Cash Float ({storeSettings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newOpeningCash}
                  onChange={(e) => setNewOpeningCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono font-bold"
                />
              </div>
              <div className="flex-1">
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Cashier On Duty</label>
                <input
                  type="text"
                  required
                  value={openedByStaff}
                  onChange={(e) => setOpenedByStaff(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-md shrink-0 shadow-xs"
              >
                Open New Shift
              </button>
            </form>
          </div>
        )}

        {/* Payouts Table */}
        <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] overflow-hidden shadow-2xs text-xs">
          <div className="p-3 border-b border-[#E8E3D7] dark:border-[#182744] bg-[#F5F2EB] dark:bg-[#0F1A2E] font-semibold text-slate-800 dark:text-slate-200">
            Cash Drops & Petty Payouts Ledger
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#FAF8F5] dark:bg-[#0A1221] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4">Reason / Vendor</th>
                <th className="px-4 text-right">Amount Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
              {registerShift.payouts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-slate-400">
                    No cash payouts recorded in this shift.
                  </td>
                </tr>
              ) : (
                registerShift.payouts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] transition-colors">
                    <td className="px-4 py-2 font-mono text-slate-500 text-[11px]">
                      {new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 font-medium text-slate-800 dark:text-slate-200">{p.reason}</td>
                    <td className="px-4 text-right font-mono font-bold text-rose-600">
                      -{storeSettings.currencySymbol}{p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Closed Shift Summary */}
        {!registerShift.isOpen && registerShift.closedAt && (
          <div className="p-5 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs text-xs space-y-3">
            <span className="font-bold text-sm text-slate-900 dark:text-white block">
              Z-Report Summary ({registerShift.id})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52]">
              <div>
                <span className="text-slate-500">Expected Cash:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {storeSettings.currencySymbol}{registerShift.closingExpectedCash?.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Actual Counted:</span>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {storeSettings.currencySymbol}{registerShift.closingActualCash?.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Variance:</span>
                <div className={`font-mono font-bold ${
                  (registerShift.cashVariance || 0) === 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-600'
                }`}>
                  {storeSettings.currencySymbol}{registerShift.cashVariance?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Record Payout */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-md p-5 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Record Cash Drawer Payout</h3>
            <form onSubmit={handleAddPayout} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Reason for Cash Drop *</label>
                <input
                  type="text"
                  required
                  value={payoutReason}
                  onChange={(e) => setPayoutReason(e.target.value)}
                  placeholder="e.g. Courier delivery payment, cleaning supplies"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Amount ({storeSettings.currencySymbol})</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.01"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Record Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Denomination Count & Close Shift */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-lg p-5 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              End of Day Cash Drawer Reconciliation
            </h3>
            <p className="text-slate-500 mb-3 text-[11px]">
              Count physical bills in drawer to verify against expected balance of {storeSettings.currencySymbol}{expectedCashInDrawer.toFixed(2)}.
            </p>

            <form onSubmit={handleCloseShift} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">$100 Bills</label>
                  <input
                    type="number"
                    min="0"
                    value={c100 || ''}
                    onChange={(e) => setC100(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">$50 Bills</label>
                  <input
                    type="number"
                    min="0"
                    value={c50 || ''}
                    onChange={(e) => setC50(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">$20 Bills</label>
                  <input
                    type="number"
                    min="0"
                    value={c20 || ''}
                    onChange={(e) => setC20(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">$10 Bills</label>
                  <input
                    type="number"
                    min="0"
                    value={c10 || ''}
                    onChange={(e) => setC10(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">$5 Bills</label>
                  <input
                    type="number"
                    min="0"
                    value={c5 || ''}
                    onChange={(e) => setC5(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">$1 Bills</label>
                  <input
                    type="number"
                    min="0"
                    value={c1 || ''}
                    onChange={(e) => setC1(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Coins / Loose Change Value ({storeSettings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={coins || ''}
                  onChange={(e) => setCoins(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-2 py-1 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono"
                />
              </div>

              {/* Count Result Box */}
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Counted Cash:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {storeSettings.currencySymbol}{countedCashTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Register Cash:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {storeSettings.currencySymbol}{expectedCashInDrawer.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E8E3D7] dark:border-[#182744] font-semibold">
                  <span>Variance (Over / Short):</span>
                  <span className={`font-mono ${closingVariance === 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-600'}`}>
                    {closingVariance > 0 ? '+' : ''}{storeSettings.currencySymbol}{closingVariance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Confirm & Finalize Z-Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
