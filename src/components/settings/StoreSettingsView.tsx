import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Building2, 
  Receipt, 
  ShieldCheck 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';

export const StoreSettingsView: React.FC = () => {
  const { 
    storeSettings, 
    updateStoreSettings, 
    exportDatabaseJson, 
    importDatabaseJson, 
    resetToDefaultData 
  } = useStore();

  const [form, setForm] = useState<StoreSettings>({ ...storeSettings });
  const [savedNotice, setSavedNotice] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleExportJson = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CellPulse_CRM_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          alert('Database restored successfully!');
          window.location.reload();
        } else {
          setImportError('Invalid backup file format. Please upload a valid CellPulse JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default factory demonstration data? This will reset all current changes.')) {
      resetToDefaultData();
      alert('Data reset to defaults.');
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#FAF8F5] dark:bg-[#080E1A] p-4 sm:p-6 select-none">
      <div className="max-w-4xl mx-auto w-full space-y-5 sm:space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Store Profile & Management Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure receipt header, tax calculation, warranty clauses, and offline database backups.
          </p>
        </div>

        {savedNotice && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-md text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Store settings saved successfully.</span>
          </div>
        )}

        {importError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-md text-xs text-rose-800 dark:text-rose-300">
            {importError}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-5 sm:space-y-6 text-xs">
          {/* Section 1: Business Identity */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Business Profile & Header Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Tagline / Specialization</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Address Line 2 / Suite</label>
                <input
                  type="text"
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Counter Telephone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Official Support Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Tax ID / GSTIN / VAT #</label>
                <input
                  type="text"
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Taxation & Currency */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
              <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Currency & Tax Policies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                  className="w-24 px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Sales Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.defaultTaxRate}
                  onChange={(e) => setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  className="w-32 px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Repair Hardware Warranty Clause (printed on Work Orders)
              </label>
              <textarea
                rows={2}
                value={form.repairWarrantyClause}
                onChange={(e) => setForm({ ...form, repairWarrantyClause: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Sales Return / Exchange Terms (printed on Invoices)
              </label>
              <textarea
                rows={2}
                value={form.salesReturnPolicy}
                onChange={(e) => setForm({ ...form, salesReturnPolicy: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs transition-colors"
            >
              Save Store Profile
            </button>
          </div>
        </form>

        {/* Section 3: Database Backup & Operations */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Database Backup, Restore & Reset</span>
          </div>
          <p className="text-slate-500">
            Export a complete JSON snapshot of all customer accounts, IMEI inventory, repair tickets, and invoices.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportJson}
              className="px-4 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Database (JSON)</span>
            </button>

            <label className="px-4 py-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-white dark:bg-[#0F1A2E] text-slate-800 dark:text-slate-200 font-medium hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Restore from JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-medium hover:bg-rose-100 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Factory Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
