import React from 'react';
import { 
  Sun, 
  Moon, 
  Wrench, 
  ShoppingCart, 
  SlidersHorizontal,
  CircleDollarSign,
  BookOpen,
  Menu
} from 'lucide-react';
import { useStore, ActiveView } from '../../context/StoreContext';

const viewTitles: Record<ActiveView, { section: string; title: string }> = {
  pos: { section: 'Sales & Billing', title: 'Counter POS Terminal' },
  repairs: { section: 'Workshop Bench', title: 'Repair Tickets & Work Orders' },
  inventory: { section: 'Catalog', title: 'IMEI Devices & Spare Parts' },
  crm: { section: 'Clients', title: 'Customer Accounts & Loyalty' },
  sales: { section: 'Finance', title: 'Sales Ledger & Tax Invoices' },
  tradein: { section: 'Buyback', title: 'Trade-In Inspection Desk' },
  register: { section: 'Operations', title: 'Cash Register & Day-End Z-Report' },
  settings: { section: 'System', title: 'Store Settings & Data Backup' }
};

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    isCompactDensity, 
    setIsCompactDensity, 
    isDarkMode, 
    setIsDarkMode,
    registerShift,
    storeSettings,
    setIsClientGuideOpen,
    setIsMobileNavOpen
  } = useStore();

  const currentInfo = viewTitles[activeView];

  // Calculate current estimated cash in register
  const totalPayouts = registerShift.payouts.reduce((sum, p) => sum + p.amount, 0);
  const currentCashInDrawer = registerShift.openingCash + registerShift.cashSales - totalPayouts;

  return (
    <header className="h-16 border-b border-[#E8E3D7] dark:border-[#182744] bg-[#FFFFFF] dark:bg-[#0A1221] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 transition-colors">
      {/* Zone 1: Mobile Hamburger & Contextual Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-[#F5F2EB] dark:hover:bg-[#14223D] transition-colors shrink-0"
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="hidden xs:flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            <span className="truncate">{storeSettings.storeName}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-teal-700 dark:text-teal-400">{currentInfo.section}</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Drawer Status & Table Density (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        {/* Cash Drawer Shift Indicator */}
        <button
          onClick={() => setActiveView('register')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-700 dark:text-slate-300 hover:border-teal-600/40 dark:hover:border-teal-500/40 transition-colors shadow-2xs"
          title="Click to view Cash Register details"
        >
          <CircleDollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Drawer:</span>
          <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
            {storeSettings.currencySymbol}{currentCashInDrawer.toFixed(2)}
          </span>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200/80 dark:border-teal-800/60">
            {registerShift.isOpen ? 'Active' : 'Closed'}
          </span>
        </button>

        {/* High-density grid switch */}
        <button
          onClick={() => setIsCompactDensity(!isCompactDensity)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors shadow-2xs ${
            isCompactDensity
              ? 'bg-[#14223D] text-white border-[#14223D] dark:bg-teal-600 dark:border-teal-600 dark:text-white'
              : 'bg-[#FAF8F5] dark:bg-[#0F1A2E] text-slate-600 dark:text-slate-300 border-[#E8E3D7] dark:border-[#1C2E52] hover:bg-[#F5F2EB]'
          }`}
          title="Toggle table row height density"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{isCompactDensity ? 'Compact' : 'Comfortable'}</span>
        </button>
      </div>

      {/* Zone 3: Client Guide + Primary Action + Theme toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={() => setIsClientGuideOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs whitespace-nowrap"
          title="Open Step-by-Step Client Guide & Manual (A to Z)"
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
          <span className="hidden sm:inline">Client Guide</span>
          <span className="sm:hidden text-[11px]">Guide</span>
        </button>

        {activeView !== 'pos' && (
          <button
            onClick={() => setActiveView('pos')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">New Sale (F2)</span>
            <span className="sm:hidden text-[11px]">Sale</span>
          </button>
        )}

        {activeView === 'pos' && (
          <button
            onClick={() => setActiveView('repairs')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">New Repair (F3)</span>
            <span className="sm:hidden text-[11px]">Repair</span>
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 sm:p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#14223D] transition-colors border border-transparent hover:border-[#E8E3D7] dark:hover:border-[#1C2E52]"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
