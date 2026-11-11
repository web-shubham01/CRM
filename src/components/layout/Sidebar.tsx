import React from 'react';
import { 
  ShoppingCart, 
  Wrench, 
  Smartphone, 
  Users, 
  Receipt, 
  ArrowLeftRight, 
  Coins, 
  Settings, 
  Search, 
  Keyboard, 
  BookOpen, 
  X,
  Sparkles
} from 'lucide-react';
import { useStore, ActiveView } from '../../context/StoreContext';

interface NavItem {
  id: ActiveView;
  label: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    repairTickets, 
    spareParts, 
    devices, 
    setIsImeiLookupOpen, 
    setIsClientGuideOpen,
    isMobileNavOpen,
    setIsMobileNavOpen
  } = useStore();

  const pendingRepairsCount = repairTickets.filter(
    t => t.status !== 'COMPLETED_DELIVERED' && t.status !== 'CANCELLED_RETURNED'
  ).length;

  const lowStockCount = spareParts.filter(p => p.stockQty <= p.minAlertQty).length;
  const inStockPhonesCount = devices.filter(d => d.status === 'In Stock').length;

  const navItems: NavItem[] = [
    {
      id: 'pos',
      label: 'Counter POS',
      shortcut: 'F2',
      icon: ShoppingCart
    },
    {
      id: 'repairs',
      label: 'Repair Tickets',
      shortcut: 'F3',
      icon: Wrench,
      badge: pendingRepairsCount
    },
    {
      id: 'inventory',
      label: 'IMEI & Stock',
      icon: Smartphone,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    {
      id: 'crm',
      label: 'Customer CRM',
      shortcut: 'F4',
      icon: Users
    },
    {
      id: 'sales',
      label: 'Sales Ledger',
      icon: Receipt
    },
    {
      id: 'tradein',
      label: 'Trade-In Desk',
      icon: ArrowLeftRight
    },
    {
      id: 'register',
      label: 'Cash Register',
      icon: Coins
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: Settings
    }
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    setIsMobileNavOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A1221] text-slate-300">
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#182744] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-teal-600 text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-xs">
              CP
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block leading-tight">
                CellPulse CRM
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                Retail & Repair Suite
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#14223D] transition-colors"
            aria-label="Close navigation menu"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global IMEI / Search Trigger */}
        <div className="p-3 border-b border-[#142038]">
          <button
            onClick={() => {
              setIsImeiLookupOpen(true);
              setIsMobileNavOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 bg-[#0F1A2E] hover:bg-[#142440] border border-[#1C2E52] rounded-md transition-colors text-left group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-teal-400 group-hover:text-teal-300 transition-colors" />
              <span>Lookup IMEI / Phone</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[#0A1221] border border-[#1C2E52] rounded font-mono text-slate-400">
              /
            </kbd>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-md transition-colors relative ${
                  isActive
                    ? 'bg-[#14223D] text-white font-semibold border-l-2 border-teal-400 shadow-2xs'
                    : 'text-slate-300 hover:bg-[#0F1A2E] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      isActive 
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                        : 'bg-[#14223D] text-slate-300 border border-[#1C2E52]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.shortcut && (
                    <span className={`text-[10px] font-mono opacity-60 ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                      {item.shortcut}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Shortcuts summary */}
      <div className="p-4 border-t border-[#182744] text-xs text-slate-400 space-y-2.5 shrink-0 bg-[#080E1A]">
        <button
          onClick={() => {
            setIsClientGuideOpen(true);
            setIsMobileNavOpen(false);
          }}
          className="w-full flex items-center justify-between p-2 rounded-md bg-[#0F1E36] border border-teal-900/60 text-teal-300 font-semibold hover:bg-[#142646] hover:border-teal-700/60 transition-colors text-xs"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Client Guide (A-Z)</span>
          </span>
          <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800/80 px-1.5 py-0.5 rounded">
            Manual
          </span>
        </button>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span>In Stock:</span>
          <span className="font-mono font-semibold text-slate-200 tabular-nums">
            {inStockPhonesCount} phones
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span>Bench Queue:</span>
          <span className="font-mono font-semibold text-amber-400 tabular-nums">
            {pendingRepairsCount} active
          </span>
        </div>
        <div className="pt-2 border-t border-[#142038] flex items-center gap-1.5 text-[11px] text-slate-400">
          <Keyboard className="w-3.5 h-3.5 text-slate-400" />
          <span>F2 POS · F3 Repair · F4 CRM</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 border-r border-[#182744] bg-[#0A1221] hidden lg:flex flex-col justify-between shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0A1221] shadow-2xl border-r border-[#182744] flex flex-col justify-between select-none transform transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
};
