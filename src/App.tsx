/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PosTerminal } from './components/pos/PosTerminal';
import { RepairBoard } from './components/repairs/RepairBoard';
import { InventoryManager } from './components/inventory/InventoryManager';
import { CustomerDirectory } from './components/crm/CustomerDirectory';
import { SalesLedger } from './components/sales/SalesLedger';
import { TradeInDesk } from './components/tradein/TradeInDesk';
import { CashRegister } from './components/register/CashRegister';
import { StoreSettingsView } from './components/settings/StoreSettingsView';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { JobSheetModal } from './components/modals/JobSheetModal';
import { ImeiLookupModal } from './components/modals/ImeiLookupModal';
import { ClientUserGuideModal } from './components/modals/ClientUserGuideModal';

const AppContent: React.FC = () => {
  const { activeView, isClientGuideOpen, setIsClientGuideOpen } = useStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#080E1A] text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 min-h-0 overflow-hidden relative">
          {activeView === 'pos' && <PosTerminal />}
          {activeView === 'repairs' && <RepairBoard />}
          {activeView === 'inventory' && <InventoryManager />}
          {activeView === 'crm' && <CustomerDirectory />}
          {activeView === 'sales' && <SalesLedger />}
          {activeView === 'tradein' && <TradeInDesk />}
          {activeView === 'register' && <CashRegister />}
          {activeView === 'settings' && <StoreSettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <ReceiptModal />
      <JobSheetModal />
      <ImeiLookupModal />
      <ClientUserGuideModal 
        isOpen={isClientGuideOpen} 
        onClose={() => setIsClientGuideOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
