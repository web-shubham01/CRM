import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  ShoppingCart, 
  Wrench, 
  Smartphone, 
  Users, 
  ArrowLeftRight, 
  Coins, 
  Settings, 
  CheckCircle2, 
  Keyboard, 
  Copy, 
  Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface GuideChapter {
  id: string;
  letter: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: {
    step: string;
    action: string;
    tip: string;
  }[];
  clientPitch: string;
}

const chapters: GuideChapter[] = [
  {
    id: 'pos',
    letter: 'A',
    title: 'Counter POS & Fast Billing',
    shortDesc: 'Sell phones by IMEI, ring up accessories, collect repair balances & print receipts.',
    icon: ShoppingCart,
    clientPitch: 'Eliminates counter bottlenecks. Cashiers can ring up phones by 15-digit IMEI, accessories, and finished repair pickups on a single ticket with instant 80mm thermal receipt printing.',
    steps: [
      {
        step: '1. Select Products or Scan',
        action: 'Use the left catalog tabs to pick accessories or available phones. Or type barcode/IMEI into the search bar.',
        tip: 'Each phone in stock is bound to its unique IMEI so sold serial numbers are never duplicated.'
      },
      {
        step: '2. Attach Customer Profile',
        action: 'Type the customer phone number in the top-right field. Select from the dropdown or click "+ New" for first-time walk-ins.',
        tip: 'Attaching a customer automatically tracks lifetime spend and accumulates store loyalty points.'
      },
      {
        step: '3. Optional: Deduct Trade-In Credit',
        action: 'If the customer is trading in an old phone, click "Deduct Customer Trade-In Device", enter IMEI, and agreed payout.',
        tip: 'The credit is automatically subtracted from the total, and the old phone is placed into pre-owned stock.'
      },
      {
        step: '4. Choose Payment & Tender',
        action: 'Select Cash, Card Terminal, or UPI / Transfer. For cash, click quick buttons ($20, $50, $100, Exact) to see change due.',
        tip: 'Change due is computed automatically in real-time to prevent counter math errors.'
      },
      {
        step: '5. Complete Sale & Print Receipt',
        action: 'Click "Complete Sale & Print Receipt". Switch between 80mm thermal receipt or standard A4 invoice and click Print.',
        tip: 'Press Escape anytime to close the receipt modal and return to counter mode.'
      }
    ]
  },
  {
    id: 'repairs',
    letter: 'B',
    title: 'Repair Intake & Workshop Bench',
    shortDesc: 'Work orders, screen PIN capture, 12-point inspection & spare parts allocation.',
    icon: Wrench,
    clientPitch: 'Professional repair management that protects the shop from fraudulent claims. Captures cosmetic condition, screen passcodes, pre-service hardware checklist, and parts used.',
    steps: [
      {
        step: '1. Admit Device (F3)',
        action: 'Click "New Ticket (F3)" or tap F3 on the keyboard. Enter the customer contact, device model, 15-digit IMEI, and screen PIN/passcode.',
        tip: 'Typing existing customer phone numbers instantly populates their account history and past device IMEIs.'
      },
      {
        step: '2. Select Reported Faults & Checklist',
        action: 'Click reported hardware problems (Cracked Screen, Battery Drain, Charging Port, etc.) and record existing physical cosmetic flaws.',
        tip: 'Pre-repair inspection results are permanently printed on the customer intake slip to avoid disputes.'
      },
      {
        step: '3. Assign Technician & Quote Deposit',
        action: 'Assign to a bench micro-soldering tech, set priority (Normal, Urgent, Warranty), and collect initial deposit if required.',
        tip: 'Clicking Admit automatically opens a formatted job slip ready for the thermal or laser printer.'
      },
      {
        step: '4. Allocate Spare Parts from Inventory',
        action: 'Open the ticket from the Kanban board, choose a replacement screen or battery from the spare parts dropdown, and click "Add Part".',
        tip: 'Parts are automatically deducted from stock quantity and their cost is added to the repair invoice.'
      },
      {
        step: '5. Move to Pickup Ready & Counter Checkout',
        action: 'Advance stage to "Ready for Pickup". Cashier can ring up remaining balance directly in POS under Ready Repairs tab.',
        tip: 'Once customer pays the remaining balance in POS, the ticket automatically marks as Delivered & Closed.'
      }
    ]
  },
  {
    id: 'inventory',
    letter: 'C',
    title: 'IMEI Smartphone Catalog & Stock',
    shortDesc: 'Individual IMEI device records, battery health, lock status & low stock alerts.',
    icon: Smartphone,
    clientPitch: 'True serial-level IMEI management tailored for mobile shops. Tracks dual IMEIs, grading condition, battery health percentage, and gross margins on every phone.',
    steps: [
      {
        step: '1. Register Smartphone Unit',
        action: 'Click "+ Add Smartphone", enter Make, Model, Storage, Grade (e.g. Brand New, Grade A, Refurbished), and 15-Digit IMEI.',
        tip: 'Store cost and retail prices are tracked to calculate gross profit margin in real-time.'
      },
      {
        step: '2. Track Accessories & Spare Parts',
        action: 'Switch to the Accessories or Spare Parts tabs to manage chargers, tempered glass, OEM screens, and battery inventory.',
        tip: 'Set minimum alert levels. Items falling below minimum alert show prominent reorder warnings.'
      },
      {
        step: '3. One-Click Copy & Sell',
        action: 'Click the copy icon next to any IMEI to paste into carrier unlock tools. Click "Sell in POS" to load into counter cart.',
        tip: 'Export full stock spreadsheets to CSV anytime with the download icon.'
      }
    ]
  },
  {
    id: 'crm',
    letter: 'D',
    title: 'Customer Directory & Loyalty CRM',
    shortDesc: 'Client spending records, WhatsApp messaging, loyalty points & warranty lookups.',
    icon: Users,
    clientPitch: 'Retain clients and drive repeat store visits. Shows lifetime revenue per customer, past repair tickets, and allows sending WhatsApp status updates.',
    steps: [
      {
        step: '1. Search Customer Accounts',
        action: 'Type phone number, customer name, or any past device IMEI into the search bar.',
        tip: 'All past repair job sheets and counter invoices are linked to the customer account.'
      },
      {
        step: '2. Send WhatsApp Notifications',
        action: 'Click the WhatsApp icon on the customer detail panel to open a pre-filled service update.',
        tip: 'Simulates direct WhatsApp Web dispatch to keep customers informed.'
      },
      {
        step: '3. Loyalty Tiers & Spending',
        action: 'Assign classifications: Regular Customer, VIP Member, or Wholesale / B2B.',
        tip: 'Points accumulate automatically with every counter sale.'
      }
    ]
  },
  {
    id: 'tradein',
    letter: 'E',
    title: 'Trade-In Valuation & Buyback Desk',
    shortDesc: 'Calculate trade-in offers, check IMEI blacklist status, and intake pre-owned phones.',
    icon: ArrowLeftRight,
    clientPitch: 'Turn pre-owned devices into a high-margin profit engine. Provides automated grading multipliers, defect deductions, and automatically puts purchased devices into inventory.',
    steps: [
      {
        step: '1. Select Make, Model & Condition',
        action: 'Pick the phone model preset and cosmetic grading tier (Sealed, Grade A, Grade B, Damaged).',
        tip: 'Valuation multipliers automatically compute fair market wholesale pricing.'
      },
      {
        step: '2. Verify Hardware Checks',
        action: 'Toggle screen, camera, biometrics, iCloud/FRP status, and GSMA blacklist check.',
        tip: 'Defect deductions reduce the offer automatically to protect store margins.'
      },
      {
        step: '3. Stock Directly or Deduct at POS',
        action: 'Click "Buy Device & Place in Inventory" to add directly to stock, or attach credit during Counter POS checkout.',
        tip: 'Captures customer photo ID / Driver License number for legal compliance.'
      }
    ]
  },
  {
    id: 'register',
    letter: 'F',
    title: 'Cash Drawer Balancing & Z-Report',
    shortDesc: 'Reconcile drawer float, record petty cash payouts, and print end-of-day reports.',
    icon: Coins,
    clientPitch: 'Full cash accountability. Prevents counter shrinkage with denomination calculators, petty expense tracking, and shift balancing.',
    steps: [
      {
        step: '1. Monitor Cash Drawer',
        action: 'Check drawer balance in real-time. Calculated from opening float + cash sales - recorded payouts.',
        tip: 'Card and UPI payments are tracked in a separate column for card terminal batch settlements.'
      },
      {
        step: '2. Record Petty Cash Drops',
        action: 'Click "Record Cash Payout / Drop", specify reason (courier, supplies, courier fee) and amount.',
        tip: 'Payouts are logged in the petty cash ledger with timestamps.'
      },
      {
        step: '3. End-of-Day Z-Report',
        action: 'Click "Count Drawer & Close Shift", count physical bills ($100, $50, $20, etc.) in the calculator.',
        tip: 'The system computes over/short cash variance and finalizes the daily Z-Report.'
      }
    ]
  },
  {
    id: 'settings',
    letter: 'G',
    title: 'Store Settings & Offline Backup',
    shortDesc: 'Configure receipt branding, tax rates, currency symbol & JSON database backups.',
    icon: Settings,
    clientPitch: 'Zero vendor lock-in. Full control over business name, VAT/GST percentage, warranty clauses, and offline JSON backup/restore.',
    steps: [
      {
        step: '1. Customize Business Identity',
        action: 'Set store name, tagline, address, phone number, and tax registration ID.',
        tip: 'All changes reflect on thermal receipts and printed job sheets.'
      },
      {
        step: '2. Configure Currency & Tax',
        action: 'Set your currency symbol ($, ₹, £, €, etc.) and default tax percentage.',
        tip: 'Tax is automatically calculated on all retail sales invoices.'
      },
      {
        step: '3. Export Offline Backup',
        action: 'Click "Export Full Database (JSON)" to save a backup to your computer.',
        tip: 'The JSON file can be restored onto any computer running CellPulse CRM.'
      }
    ]
  }
];

export const ClientUserGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>('pos');
  const [copiedPitch, setCopiedPitch] = useState(false);

  if (!isOpen) return null;

  const currentChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(currentChapter.clientPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-2xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E8E3D7] dark:border-[#182744] flex items-center justify-between bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                CellPulse CRM · Client Reference Manual
              </h2>
              <p className="text-[11px] text-slate-500">
                Operating manual & demonstration guide for mobile phone retail and repair centers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Chapter Nav + Right Chapter Details */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Chapter Selector Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#080E1A] p-2 sm:p-3 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 shrink-0 scrollbar-none">
            <div className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Modules & Workflows
            </div>
            {chapters.map(ch => {
              const isActive = activeChapterId === ch.id;

              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapterId(ch.id)}
                  className={`text-left p-2 rounded-md border transition-all flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap md:whitespace-normal md:w-full ${
                    isActive
                      ? 'bg-white dark:bg-[#14223D] text-slate-900 dark:text-white border-[#E8E3D7] dark:border-[#1C2E52] shadow-2xs font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-[#F5F2EB] dark:hover:bg-[#0F1A2E]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                    isActive ? 'bg-teal-700 text-white dark:bg-teal-600' : 'bg-[#EAE5D9] dark:bg-[#14223D] text-slate-700 dark:text-slate-300'
                  }`}>
                    {ch.letter}
                  </span>
                  <div className="truncate min-w-0">
                    <div className="truncate text-xs">{ch.title}</div>
                  </div>
                </button>
              );
            })}

            {/* Quick Keyboard Reference */}
            <div className="hidden md:block mt-3 p-3 bg-white dark:bg-[#0A1221] rounded-md border border-[#E8E3D7] dark:border-[#182744] space-y-1.5 text-[11px]">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-teal-600" />
                <span>Shortcuts</span>
              </div>
              <div className="text-slate-500 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between"><span>F2</span><span className="font-sans">Counter POS</span></div>
                <div className="flex justify-between"><span>F3</span><span className="font-sans">Repair Intake</span></div>
                <div className="flex justify-between"><span>F4</span><span className="font-sans">Customer CRM</span></div>
                <div className="flex justify-between"><span>/</span><span className="font-sans">Global IMEI Search</span></div>
                <div className="flex justify-between"><span>Esc</span><span className="font-sans">Close Modals</span></div>
              </div>
            </div>
          </div>

          {/* Chapter Content View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white dark:bg-[#0A1221]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                <span>Chapter {currentChapter.letter}</span>
                <span>·</span>
                <span>CellPulse Module Guide</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {currentChapter.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">
                {currentChapter.shortDesc}
              </p>
            </div>

            {/* Client Pitch Box */}
            <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Executive Summary:</span>
                </span>
                <button
                  onClick={handleCopyPitch}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1"
                >
                  {copiedPitch ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPitch ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic text-xs">
                "{currentChapter.clientPitch}"
              </p>
            </div>

            {/* Step-by-Step Walkthrough */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Step-by-Step Workflow
              </h4>

              <div className="space-y-2.5">
                {currentChapter.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-1 shadow-2xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{st.step}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs pl-7 leading-relaxed">
                      {st.action}
                    </p>
                    <div className="text-[11px] text-slate-500 pl-7 flex items-center gap-1.5 pt-0.5">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">Tip:</span>
                      <span>{st.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0F1A2E] flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500">
            CellPulse Mobile POS & Repair Management System · Client Reference Manual
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Back to System
          </button>
        </div>
      </div>
    </div>
  );
};
