import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Trash2,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Customer } from '../../types';

export const CustomerDirectory: React.FC = () => {
  const { 
    customers, 
    addCustomer, 
    deleteCustomer, 
    repairTickets, 
    salesInvoices, 
    setActiveJobSheetModal, 
    setActiveInvoiceModal,
    setActiveView,
    storeSettings,
    isCompactDensity 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState<Customer['customerType']>('Regular Customer');
  const [newNotes, setNewNotes] = useState('');
  const [newImei, setNewImei] = useState('');

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customers.filter(c => {
      return !q || 
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.associatedImeis.some(im => im.includes(q));
    });
  }, [customers, searchQuery]);

  // Customer Linked Data
  const customerRepairs = useMemo(() => {
    if (!selectedCustomer) return [];
    return repairTickets.filter(r => 
      r.customerPhone === selectedCustomer.phone || 
      r.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [repairTickets, selectedCustomer]);

  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return salesInvoices.filter(i => 
      i.customerId === selectedCustomer.id || 
      i.customerPhone === selectedCustomer.phone
    );
  }, [salesInvoices, selectedCustomer]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const created = addCustomer({
      name: newName,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      customerType: newType,
      notes: newNotes,
      associatedImeis: newImei ? [newImei] : []
    });

    setSelectedCustomer(created);
    setIsAddCustomerOpen(false);
    // Reset
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewNotes('');
    setNewImei('');
  };

  const openWhatsAppSimulation = (phone: string, name: string) => {
    const text = encodeURIComponent(`Hello ${name}, this is ${storeSettings.storeName}. Regarding your device repair and store account...`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-[#FAF8F5] dark:bg-[#080E1A]">
      {/* LEFT: Customer List & Directory Table */}
      <div className={`flex-1 flex-col border-r border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#080E1A] min-w-0 ${
        selectedCustomer ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Search Bar & Action Strip */}
        <div className="p-3 sm:p-4 border-b border-[#E8E3D7] dark:border-[#182744] bg-white dark:bg-[#0A1221] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone number, or IMEI..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs transition-colors shrink-0 whitespace-nowrap shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Add Customer Account</span>
            <span className="sm:hidden">Add Customer</span>
          </button>
        </div>

        {/* Directory Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left min-w-[860px] border-collapse">
              <thead className="bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>Client Name</th>
                  <th className="px-4">Phone / Contact</th>
                  <th className="px-4">Account Type</th>
                  <th className="px-4 text-center">Loyalty Pts</th>
                  <th className="px-4 text-right">Lifetime Spend</th>
                  <th className="px-4">Linked IMEIs</th>
                  <th className="px-4">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
                {filteredCustomers.map(customer => {
                  const isSelected = selectedCustomer?.id === customer.id;

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 dark:bg-teal-950/30 font-medium' : ''
                      }`}
                    >
                      <td className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{customer.name}</div>
                        {customer.email && <div className="text-[11px] text-slate-500">{customer.email}</div>}
                      </td>
                      <td className="px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {customer.phone}
                      </td>
                      <td className="px-4">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          customer.customerType === 'VIP Member'
                            ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80'
                            : customer.customerType === 'Wholesale / B2B'
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                            : 'bg-[#F5F2EB] text-slate-700 dark:bg-[#14223D] dark:text-slate-300'
                        }`}>
                          {customer.customerType}
                        </span>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                        {customer.loyaltyPoints} pts
                      </td>
                      <td className="px-4 text-right font-mono font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                        {storeSettings.currencySymbol}{customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-4 font-mono text-[11px] text-slate-500 max-w-[140px] truncate">
                        {customer.associatedImeis.length > 0 ? customer.associatedImeis.join(', ') : 'None'}
                      </td>
                      <td className="px-4 text-[11px] text-slate-400">
                        {new Date(customer.lastVisit).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT: Customer Detail Profile & History Drawer */}
      <div className={`w-full lg:w-[420px] bg-white dark:bg-[#0A1221] flex-col justify-between shrink-0 border-t lg:border-t-0 select-none text-xs ${
        selectedCustomer ? 'flex' : 'hidden lg:flex'
      }`}>
        {selectedCustomer ? (
          <div className="h-full flex flex-col justify-between overflow-hidden">
            {/* Customer Profile Header */}
            <div className="p-4 border-b border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0F1A2E]">
              {/* Mobile back button */}
              <button
                onClick={() => setSelectedCustomer(null)}
                className="lg:hidden mb-2 text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Directory</span>
              </button>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Account ID: <span className="font-mono">{selectedCustomer.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openWhatsAppSimulation(selectedCustomer.phone, selectedCustomer.name)}
                    className="p-1.5 text-slate-500 hover:text-teal-600 border border-[#E8E3D7] dark:border-[#1C2E52] rounded bg-white dark:bg-[#0A1221]"
                    title="Send WhatsApp Update"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete customer ${selectedCustomer.name}?`)) {
                        deleteCustomer(selectedCustomer.id);
                        setSelectedCustomer(null);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 border border-[#E8E3D7] dark:border-[#1C2E52] rounded bg-white dark:bg-[#0A1221]"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Contact Info */}
              <div className="mt-3 space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-medium">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  CRM Notes & Preferences
                </label>
                <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-[11px] text-slate-700 dark:text-slate-300">
                  {selectedCustomer.notes || 'No customer notes recorded.'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Associated Device IMEIs ({selectedCustomer.associatedImeis.length})
                </label>
                <div className="space-y-1">
                  {selectedCustomer.associatedImeis.map((imei, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded border border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between font-mono text-[11px]"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{imei}</span>
                      <span className="text-slate-400 text-[10px]">Hardware Linked</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Service & Repair History ({customerRepairs.length})
                </label>
                {customerRepairs.length === 0 ? (
                  <div className="text-slate-400 text-[11px]">No repair work orders on file.</div>
                ) : (
                  <div className="space-y-1.5">
                    {customerRepairs.map(rep => (
                      <div
                        key={rep.id}
                        className="p-2.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded border border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="font-mono text-slate-700 dark:text-slate-300">{rep.ticketNumber}</span>
                            <span>·</span>
                            <span>{rep.deviceModel}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(rep.createdAt).toLocaleDateString()} · {rep.status.replace(/_/g, ' ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                            {storeSettings.currencySymbol}{rep.finalCost.toFixed(2)}
                          </span>
                          <button
                            onClick={() => setActiveJobSheetModal(rep)}
                            className="p-1 text-slate-400 hover:text-teal-700"
                            title="View Slip"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Purchase History & Invoices ({customerInvoices.length})
                </label>
                {customerInvoices.length === 0 ? (
                  <div className="text-slate-400 text-[11px]">No retail counter invoices on file.</div>
                ) : (
                  <div className="space-y-1.5">
                    {customerInvoices.map(inv => (
                      <div
                        key={inv.id}
                        className="p-2.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded border border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {inv.invoiceNumber}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(inv.createdAt).toLocaleDateString()} · {inv.items.length} items
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                            {storeSettings.currencySymbol}{inv.grandTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => setActiveInvoiceModal(inv)}
                            className="text-xs text-teal-700 dark:text-teal-400 hover:underline"
                          >
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 border-t border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0F1A2E] flex gap-2">
              <button
                onClick={() => setActiveView('pos')}
                className="flex-1 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs text-center shadow-xs"
              >
                Counter POS Sale
              </button>
              <button
                onClick={() => setActiveView('repairs')}
                className="flex-1 py-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-white dark:bg-[#0A1221] text-slate-800 dark:text-slate-200 font-medium text-xs text-center hover:bg-[#FAF8F5]"
              >
                Book Repair Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Users className="w-8 h-8 mb-2 opacity-30" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">Select a Customer</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click any customer row to view linked phone IMEIs, repair history, and invoices.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: Add Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-lg p-5 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Create Customer CRM Profile</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 782-9012"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rachel@domain.com"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Customer Classification</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="Regular Customer">Regular Customer</option>
                    <option value="VIP Member">VIP Member</option>
                    <option value="Wholesale / B2B">Wholesale / B2B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Primary Device IMEI</label>
                  <input
                    type="text"
                    value={newImei}
                    onChange={(e) => setNewImei(e.target.value)}
                    placeholder="35901290821901"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Internal CRM Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Preferences, preferred contact times, loyalty perks..."
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
