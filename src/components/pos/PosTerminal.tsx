import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  UserCheck, 
  UserPlus, 
  ArrowLeftRight, 
  Smartphone, 
  Headphones, 
  Wrench, 
  Check, 
  RotateCcw,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CartLineItem, TradeInItem, SalesInvoice, Customer } from '../../types';

export const PosTerminal: React.FC = () => {
  const { 
    devices, 
    accessories, 
    repairTickets, 
    customers, 
    addCustomer, 
    completePosSale, 
    setActiveInvoiceModal,
    storeSettings
  } = useStore();

  // Search & Catalog Filter
  const [catalogTab, setCatalogTab] = useState<'phones' | 'accessories' | 'repairs'>('accessories');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobilePosTab, setMobilePosTab] = useState<'catalog' | 'checkout'>('catalog');

  // Cart State
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<SalesInvoice['paymentMethod']>('Cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Customer in POS
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Trade-In attached to this POS sale
  const [attachedTradeIn, setAttachedTradeIn] = useState<TradeInItem | null>(null);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [tradeInBrand, setTradeInBrand] = useState('Apple');
  const [tradeInModel, setTradeInModel] = useState('iPhone 12');
  const [tradeInImei, setTradeInImei] = useState('');
  const [tradeInStorage, setTradeInStorage] = useState('128GB');
  const [tradeInValue, setTradeInValue] = useState<number>(180);
  const [tradeInGovtId, setTradeInGovtId] = useState('');

  // Filter Catalog Data
  const filteredPhones = useMemo(() => {
    return devices.filter(d => {
      const matchStatus = d.status === 'In Stock';
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        d.model.toLowerCase().includes(q) || 
        d.brand.toLowerCase().includes(q) || 
        d.imei1.includes(q) || 
        d.sku.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [devices, searchQuery]);

  const filteredAccessories = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return accessories.filter(a => {
      return !q || 
        a.name.toLowerCase().includes(q) || 
        a.category.toLowerCase().includes(q) || 
        a.brand.toLowerCase().includes(q) || 
        a.sku.toLowerCase().includes(q) ||
        a.barcode.includes(q);
    });
  }, [accessories, searchQuery]);

  const readyRepairs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return repairTickets.filter(r => {
      const matchStatus = r.status === 'READY_FOR_PICKUP';
      const matchSearch = !q || 
        r.ticketNumber.toLowerCase().includes(q) || 
        r.customerName.toLowerCase().includes(q) || 
        r.customerPhone.includes(q) || 
        r.deviceModel.toLowerCase().includes(q) ||
        r.imeiOrSerial.includes(q);
      return matchStatus && matchSearch;
    });
  }, [repairTickets, searchQuery]);

  // Add Item to Cart
  const addToCart = (item: CartLineItem) => {
    setCart(prev => {
      if (item.type === 'DEVICE') {
        const alreadyExists = prev.find(i => i.refId === item.refId);
        if (alreadyExists) return prev;
        return [...prev, item];
      }

      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (item.type === 'DEVICE' && delta > 0) return item;
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartLineItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = storeSettings.defaultTaxRate;
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const tradeInDeduction = attachedTradeIn ? attachedTradeIn.agreedPayoutValue : 0;
  const grandTotal = Math.max(0, Number((taxableAmount + taxAmount - tradeInDeduction).toFixed(2)));

  const tenderedVal = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, Number((tenderedVal - grandTotal).toFixed(2)));

  const setExactTender = () => setAmountTendered(grandTotal.toFixed(2));
  const setRoundTender = (val: number) => setAmountTendered(val.toFixed(2));

  // Handle Quick Customer Create
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const created = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail,
      address: 'Walk-in Store Counter',
      customerType: 'Regular Customer',
      notes: 'Created during POS transaction',
      associatedImeis: []
    });

    setSelectedCustomer(created);
    setIsNewCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
  };

  // Attach Trade-In
  const handleAttachTradeIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeInImei || tradeInValue <= 0) return;

    setAttachedTradeIn({
      brand: tradeInBrand,
      model: tradeInModel,
      imei: tradeInImei,
      storage: tradeInStorage,
      conditionGrade: 'Grade A (Excellent)',
      batteryHealth: 88,
      icloudStatus: 'Clean & Verified',
      agreedPayoutValue: tradeInValue,
      customerGovtId: tradeInGovtId
    });

    setIsTradeInModalOpen(false);
  };

  // Complete Transaction
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const invoice = completePosSale({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Counter Guest',
      customerPhone: selectedCustomer ? selectedCustomer.phone : 'N/A',
      items: cart,
      tradeInCredit: attachedTradeIn || undefined,
      discount: discountAmount,
      paymentMethod,
      amountPaid: paymentMethod === 'Cash' ? (tenderedVal || grandTotal) : grandTotal,
      notes
    });

    setCart([]);
    setDiscountAmount(0);
    setAttachedTradeIn(null);
    setAmountTendered('');
    setNotes('');
    setSelectedCustomer(null);
    setMobilePosTab('catalog');

    setActiveInvoiceModal(invoice);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-[#FAF8F5] dark:bg-[#080E1A]">
      {/* Mobile Switcher (Visible only below lg) */}
      <div className="lg:hidden p-2 bg-[#F5F2EB] dark:bg-[#0A1221] border-b border-[#E8E3D7] dark:border-[#182744] flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobilePosTab('catalog')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobilePosTab === 'catalog'
              ? 'bg-white dark:bg-[#14223D] text-slate-900 dark:text-white shadow-2xs border border-[#E8E3D7] dark:border-[#1C2E52]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Catalog ({filteredAccessories.length + filteredPhones.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePosTab('checkout')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobilePosTab === 'checkout'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white dark:bg-[#0F1A2E] text-slate-800 dark:text-slate-200 border border-[#E8E3D7] dark:border-[#1C2E52]'
          }`}
        >
          <span>Checkout ({cart.length})</span>
          <span className="font-mono font-bold">· {storeSettings.currencySymbol}{grandTotal.toFixed(2)}</span>
        </button>
      </div>

      {/* LEFT: Catalog Browser & Quick Picker */}
      <div className={`flex-1 flex-col border-r border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#080E1A] min-w-0 ${
        mobilePosTab === 'checkout' ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Catalog Search & Category Tabs */}
        <div className="p-3 sm:p-4 border-b border-[#E8E3D7] dark:border-[#182744] bg-white dark:bg-[#0A1221] space-y-2.5 sm:space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode, search by Model, IMEI, or SKU..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 dark:focus:border-teal-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tab switchers */}
            <div className="overflow-x-auto max-w-full pb-0.5 scrollbar-none">
              <div className="inline-flex rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#F5F2EB] dark:bg-[#0F1A2E] p-0.5 text-xs shrink-0 whitespace-nowrap">
                <button
                  onClick={() => setCatalogTab('accessories')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
                    catalogTab === 'accessories'
                      ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Accessories ({filteredAccessories.length})</span>
                </button>

                <button
                  onClick={() => setCatalogTab('phones')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
                    catalogTab === 'phones'
                      ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phones ({filteredPhones.length})</span>
                </button>

                <button
                  onClick={() => setCatalogTab('repairs')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
                    catalogTab === 'repairs'
                      ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Ready Repairs ({readyRepairs.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Item Grid / List */}
        <div className="flex-1 overflow-y-auto p-4">
          {catalogTab === 'accessories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredAccessories.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart({
                    id: item.id,
                    type: 'ACCESSORY',
                    name: item.name,
                    skuOrImei: `SKU: ${item.sku}`,
                    unitPrice: item.sellingPrice,
                    quantity: 1,
                    warrantyInfo: '30 Days Store Warranty',
                    refId: item.id
                  })}
                  className="p-3 bg-white dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] hover:border-teal-600/60 dark:hover:border-teal-500/60 cursor-pointer transition-all flex flex-col justify-between text-xs group shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {item.brand} · {item.category}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Barcode: {item.barcode}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#F5F2EB] dark:border-[#182744] flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Stock: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{item.stockQty}</span>
                    </span>
                    <span className="font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                      {storeSettings.currencySymbol}{item.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {catalogTab === 'phones' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredPhones.map(device => (
                <div
                  key={device.id}
                  onClick={() => addToCart({
                    id: `CART-${device.id}`,
                    type: 'DEVICE',
                    name: `${device.brand} ${device.model} (${device.storage})`,
                    skuOrImei: `IMEI: ${device.imei1}`,
                    unitPrice: device.sellingPrice,
                    quantity: 1,
                    warrantyInfo: `${device.warrantyDays} Days Store Warranty`,
                    refId: device.id
                  })}
                  className="p-3 bg-white dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] hover:border-teal-600/60 dark:hover:border-teal-500/60 cursor-pointer transition-all flex flex-col justify-between text-xs group shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                        {device.brand} {device.model}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {device.storage} · {device.color} · {device.condition}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1 flex flex-wrap gap-x-2">
                      <span>IMEI: {device.imei1}</span>
                      {device.batteryHealth && <span>Batt: {device.batteryHealth}%</span>}
                      <span>{device.carrierStatus}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#F5F2EB] dark:border-[#182744] flex items-center justify-between">
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                      {device.lockStatus}
                    </span>
                    <span className="font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                      {storeSettings.currencySymbol}{device.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {catalogTab === 'repairs' && (
            <div className="space-y-2">
              {readyRepairs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No repair tickets currently marked 'Ready for Pickup'.
                </div>
              ) : (
                readyRepairs.map(ticket => {
                  const balanceDue = Math.max(0, ticket.finalCost - ticket.depositPaid);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => addToCart({
                        id: `REP-PAY-${ticket.id}`,
                        type: 'REPAIR_PAYMENT',
                        name: `Repair Completion: ${ticket.deviceBrand} ${ticket.deviceModel} (${ticket.ticketNumber})`,
                        skuOrImei: `IMEI: ${ticket.imeiOrSerial} | Ticket: ${ticket.ticketNumber}`,
                        unitPrice: balanceDue,
                        quantity: 1,
                        warrantyInfo: ticket.warrantyPeriod,
                        refId: ticket.id
                      })}
                      className="p-3 bg-white dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] hover:border-teal-600/60 dark:hover:border-teal-500/60 cursor-pointer transition-all flex items-center justify-between text-xs group shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {ticket.ticketNumber}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {ticket.deviceBrand} {ticket.deviceModel}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 rounded">
                            Ready for Pickup
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Client: {ticket.customerName} ({ticket.customerPhone}) · Issues: {ticket.reportedIssues.join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Total Quote: {storeSettings.currencySymbol}{ticket.finalCost.toFixed(2)} | Deposit Paid: {storeSettings.currencySymbol}{ticket.depositPaid.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400">Balance Due</div>
                        <div className="font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                          {storeSettings.currencySymbol}{balanceDue.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium group-hover:underline">Add to Cart →</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Mobile Quick Floating Cart Indicator */}
        {cart.length > 0 && (
          <div className="lg:hidden p-3 bg-[#0A1221] text-white flex items-center justify-between shadow-xl shrink-0 border-t border-[#182744]">
            <div>
              <div className="text-xs font-semibold">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</div>
              <div className="font-mono font-bold text-sm text-teal-300">{storeSettings.currencySymbol}{grandTotal.toFixed(2)}</div>
            </div>
            <button
              type="button"
              onClick={() => setMobilePosTab('checkout')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>View Cart & Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Counter Register Cart & Billing */}
      <div className={`w-full lg:w-[380px] xl:w-[420px] bg-white dark:bg-[#0A1221] flex-col shrink-0 border-t lg:border-t-0 select-none overflow-y-auto h-full min-h-0 ${
        mobilePosTab === 'catalog' ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Mobile back to catalog button */}
        <div className="lg:hidden p-2 bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#1C2E52] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobilePosTab('catalog')}
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1"
          >
            <span>← Back to Products</span>
          </button>
          <span className="text-xs text-slate-500 font-medium">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</span>
        </div>

        {/* Customer Select Bar */}
        <div className="p-2 sm:p-2.5 border-b border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0F1A2E]/60">
          <div className="flex items-center justify-between gap-2">
            {selectedCustomer ? (
              <div className="flex items-center justify-between w-full bg-white dark:bg-[#14223D] px-2.5 py-1.5 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedCustomer.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono ml-2">{selectedCustomer.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Attach Customer (Phone or Name)..."
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
                  />

                  {/* Customer Autocomplete Dropdown */}
                  {customerSearch.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md shadow-2xl max-h-56 overflow-y-auto z-30 divide-y divide-[#F5F2EB] dark:divide-[#182744]">
                      {customers
                        .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
                        .map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearch('');
                            }}
                            className="p-2.5 text-xs hover:bg-[#FAF8F5] dark:hover:bg-[#14223D] cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{c.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone} · Spend: {storeSettings.currencySymbol}{c.totalSpent.toFixed(2)}</div>
                            </div>
                            <span className="text-[10px] text-teal-600 font-semibold">Attach →</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md hover:bg-[#F5F2EB] dark:hover:bg-[#14223D] shrink-0 flex items-center gap-1 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto min-h-[70px] p-2 sm:p-2.5 space-y-1.5">
          {cart.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              <RotateCcw className="w-5 h-5 mb-1.5 opacity-30" />
              <p className="font-medium text-slate-500">Cart is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click any product, phone, or repair ticket on the left to add.</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="p-2 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-xs flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {item.skuOrImei}
                  </div>
                  <div className="text-[10px] text-teal-800 dark:text-teal-300 font-mono mt-0.5 font-semibold">
                    {storeSettings.currencySymbol}{item.unitPrice.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.type !== 'DEVICE' && (
                    <div className="flex items-center border border-[#E8E3D7] dark:border-[#1C2E52] rounded bg-white dark:bg-[#0A1221]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 font-mono text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="w-16 text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-xs tabular-nums">
                    {storeSettings.currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Trade In Credit banner inside Cart */}
          {attachedTradeIn && (
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 rounded-md border border-teal-200 dark:border-teal-800/80 text-xs flex items-center justify-between">
              <div>
                <div className="font-semibold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Trade-In Credit Attached</span>
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400">
                  {attachedTradeIn.brand} {attachedTradeIn.model} ({attachedTradeIn.storage})
                </div>
                <div className="text-[10px] text-teal-600 font-mono">
                  IMEI: {attachedTradeIn.imei}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-800 dark:text-teal-200 tabular-nums">
                  -{storeSettings.currencySymbol}{attachedTradeIn.agreedPayoutValue.toFixed(2)}
                </span>
                <button
                  onClick={() => setAttachedTradeIn(null)}
                  className="text-xs text-teal-700 hover:text-rose-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Counter Summary & Payment Options */}
        <div className="p-3 sm:p-3.5 border-t border-[#E8E3D7] dark:border-[#182744] bg-[#FAF8F5] dark:bg-[#0A1221] space-y-2 shrink-0">
          {!attachedTradeIn && (
            <button
              onClick={() => setIsTradeInModalOpen(true)}
              className="w-full py-1.5 px-2.5 rounded-md border border-dashed border-[#DDD6C5] dark:border-[#1C2E52] hover:border-teal-600 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-[#F5F2EB] dark:hover:bg-[#0F1A2E] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />
              <span>Deduct Customer Trade-In Device</span>
            </button>
          )}

          {/* Numerical Breakdown */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums font-semibold">{storeSettings.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Discount ({storeSettings.currencySymbol}):</span>
              <input
                type="number"
                min="0"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-20 px-2 py-0.5 text-right text-xs bg-white dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono font-bold"
              />
            </div>

            {attachedTradeIn && (
              <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                <span>Trade-In Value:</span>
                <span className="font-mono tabular-nums">-{storeSettings.currencySymbol}{tradeInDeduction.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax ({taxRate}%):</span>
              <span className="font-mono tabular-nums">{storeSettings.currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-[#E8E3D7] dark:border-[#182744]">
              <span>Grand Total:</span>
              <span className="font-mono tabular-nums text-base sm:text-lg text-teal-800 dark:text-teal-300">{storeSettings.currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Payment Method
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {(['Cash', 'Credit/Debit Card', 'Bank Transfer / UPI'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 px-1.5 rounded-md font-medium border text-center transition-colors truncate text-[11px] sm:text-xs ${
                    paymentMethod === method
                      ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-600 dark:border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-[#0F1A2E] border-[#E8E3D7] dark:border-[#1C2E52] text-slate-700 dark:text-slate-300 hover:bg-[#F5F2EB]'
                  }`}
                >
                  {method === 'Cash' && 'Cash'}
                  {method === 'Credit/Debit Card' && 'Card Terminal'}
                  {method === 'Bank Transfer / UPI' && 'UPI / Transfer'}
                </button>
              ))}
            </div>
          </div>

          {/* If Cash: Quick Cash Tender & Change */}
          {paymentMethod === 'Cash' && (
            <div className="p-2 bg-white dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Cash Received:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-mono text-xs">{storeSettings.currencySymbol}</span>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder={grandTotal.toFixed(2)}
                    className="w-20 px-2 py-0.5 text-right bg-[#FAF8F5] dark:bg-[#0A1221] border border-[#E8E3D7] dark:border-[#1C2E52] rounded font-mono font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={setExactTender}
                  className="px-1.5 py-0.5 text-[10px] bg-[#F5F2EB] dark:bg-[#14223D] rounded text-slate-700 dark:text-slate-200 font-medium hover:bg-[#EAE5D9] transition-colors"
                >
                  Exact
                </button>
                {[20, 50, 100, 500].map(v => (
                  <button
                    key={v}
                    onClick={() => setRoundTender(v)}
                    className="px-1.5 py-0.5 text-[10px] bg-[#F5F2EB] dark:bg-[#14223D] rounded text-slate-700 dark:text-slate-200 font-mono hover:bg-[#EAE5D9] transition-colors"
                  >
                    {storeSettings.currencySymbol}{v}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-[#F5F2EB] dark:border-[#182744] text-slate-800 dark:text-slate-200 font-medium">
                <span>Change Due:</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-teal-700 dark:text-teal-400 tabular-nums">
                  {storeSettings.currencySymbol}{changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Primary Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 px-3 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Complete Sale & Print Receipt ({storeSettings.currencySymbol}{grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* MODAL: New Customer Quick Create */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-md p-5 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Walk-in Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Jason Brooks"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 302-9182"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="jason@domain.com"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Save & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fast Trade-In Valuation Attachment */}
      {isTradeInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-md p-5 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4 text-teal-600" />
              <span>Attach Buyback Trade-In Credit</span>
            </h3>
            <p className="text-slate-500 mb-3 text-[11px]">
              Deduct an old phone against today's purchase. Device will be added to Pre-Owned Stock.
            </p>
            <form onSubmit={handleAttachTradeIn} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Brand</label>
                  <select
                    value={tradeInBrand}
                    onChange={(e) => setTradeInBrand(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Model & Storage</label>
                  <input
                    type="text"
                    required
                    value={tradeInModel}
                    onChange={(e) => setTradeInModel(e.target.value)}
                    placeholder="e.g. iPhone 12 128GB"
                    className="w-full px-2 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">15-Digit IMEI Number *</label>
                <input
                  type="text"
                  required
                  value={tradeInImei}
                  onChange={(e) => setTradeInImei(e.target.value)}
                  placeholder="359281048102948"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Agreed Credit Value ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tradeInValue}
                    onChange={(e) => setTradeInValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Customer ID / DL #</label>
                  <input
                    type="text"
                    value={tradeInGovtId}
                    onChange={(e) => setTradeInGovtId(e.target.value)}
                    placeholder="TX-DL-84920"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTradeInModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Apply Trade-In Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
