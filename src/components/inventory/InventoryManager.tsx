import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Smartphone, 
  Headphones, 
  Wrench, 
  Download, 
  Check, 
  Trash2,
  ShoppingCart, 
  Copy
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PhoneDevice, AccessoryItem, SparePartItem, DeviceCondition } from '../../types';

export const InventoryManager: React.FC = () => {
  const { 
    devices, 
    accessories, 
    spareParts, 
    addPhoneDevice, 
    updatePhoneDevice, 
    deletePhoneDevice,
    addAccessory, 
    deleteAccessory,
    addSparePart, 
    deleteSparePart,
    setActiveView,
    storeSettings,
    isCompactDensity 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'phones' | 'accessories' | 'parts'>('phones');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'sold'>('in_stock');
  const [copiedImei, setCopiedImei] = useState<string | null>(null);

  // Modals
  const [isAddPhoneModalOpen, setIsAddPhoneModalOpen] = useState(false);
  const [isAddAccessoryModalOpen, setIsAddAccessoryModalOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);

  // Phone Form State
  const [phoneBrand, setPhoneBrand] = useState('Apple');
  const [phoneModel, setPhoneModel] = useState('');
  const [phoneStorage, setPhoneStorage] = useState('256GB');
  const [phoneColor, setPhoneColor] = useState('Natural Titanium');
  const [phoneImei1, setPhoneImei1] = useState('');
  const [phoneImei2, setPhoneImei2] = useState('');
  const [phoneCondition, setPhoneCondition] = useState<DeviceCondition>('Brand New Sealed');
  const [phoneBattery, setPhoneBattery] = useState<number>(100);
  const [phoneCarrier, setPhoneCarrier] = useState<'Factory Unlocked' | 'AT&T' | 'Verizon' | 'T-Mobile'>('Factory Unlocked');
  const [phoneLockStatus, setPhoneLockStatus] = useState<'Clean & Verified' | 'FRP Clean' | 'iCloud Signed Out'>('Clean & Verified');
  const [phoneCost, setPhoneCost] = useState<number>(650);
  const [phoneSelling, setPhoneSelling] = useState<number>(849);
  const [phoneWarranty, setPhoneWarranty] = useState<number>(90);

  // Accessory Form State
  const [accName, setAccName] = useState('');
  const [accCategory, setAccCategory] = useState<AccessoryItem['category']>('Protective Cases');
  const [accBrand, setAccBrand] = useState('Spigen');
  const [accModels, setAccModels] = useState('iPhone 15 Pro');
  const [accQty, setAccQty] = useState(15);
  const [accMinAlert, setAccMinAlert] = useState(3);
  const [accCost, setAccCost] = useState<number>(6.50);
  const [accSelling, setAccSelling] = useState<number>(24.99);
  const [accBarcode, setAccBarcode] = useState('');

  // Spare Part Form State
  const [partName, setPartName] = useState('');
  const [partType, setPartType] = useState<SparePartItem['partType']>('OLED / LCD Screen');
  const [partBrand, setPartBrand] = useState('Apple');
  const [partModels, setPartModels] = useState('iPhone 14');
  const [partQty, setPartQty] = useState(4);
  const [partMinAlert, setPartMinAlert] = useState(2);
  const [partCost, setPartCost] = useState<number>(45);
  const [partSelling, setPartSelling] = useState<number>(110);
  const [partSupplier, setPartSupplier] = useState('MobileSentrix OEM');

  // Filter Data
  const filteredPhones = useMemo(() => {
    return devices.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        d.model.toLowerCase().includes(q) || 
        d.brand.toLowerCase().includes(q) || 
        d.imei1.includes(q) || 
        (d.imei2 && d.imei2.includes(q)) ||
        d.sku.toLowerCase().includes(q);

      const matchStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'in_stock' ? d.status === 'In Stock' || d.status === 'Reserved' :
        d.status === 'Sold';

      return matchSearch && matchStatus;
    });
  }, [devices, searchQuery, statusFilter]);

  const filteredAccessories = useMemo(() => {
    return accessories.filter(a => {
      const q = searchQuery.toLowerCase();
      return !q || 
        a.name.toLowerCase().includes(q) || 
        a.category.toLowerCase().includes(q) || 
        a.sku.toLowerCase().includes(q) ||
        a.barcode.includes(q) ||
        a.compatibleModels.toLowerCase().includes(q);
    });
  }, [accessories, searchQuery]);

  const filteredParts = useMemo(() => {
    return spareParts.filter(p => {
      const q = searchQuery.toLowerCase();
      return !q || 
        p.name.toLowerCase().includes(q) || 
        p.partType.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.compatibleModels.toLowerCase().includes(q);
    });
  }, [spareParts, searchQuery]);

  const copyImeiToClipboard = (imei: string) => {
    navigator.clipboard.writeText(imei);
    setCopiedImei(imei);
    setTimeout(() => setCopiedImei(null), 1500);
  };

  const exportStockCsv = () => {
    let csv = '';
    if (activeTab === 'phones') {
      csv = 'Brand,Model,Storage,Color,IMEI1,IMEI2,Condition,Battery,Cost,SellingPrice,Status\n';
      filteredPhones.forEach(d => {
        csv += `"${d.brand}","${d.model}","${d.storage}","${d.color}","${d.imei1}","${d.imei2 || ''}","${d.condition}",${d.batteryHealth || ''},${d.costPrice},${d.sellingPrice},"${d.status}"\n`;
      });
    } else if (activeTab === 'accessories') {
      csv = 'Name,Category,Brand,Compatible,Stock,Cost,SellingPrice,Barcode\n';
      filteredAccessories.forEach(a => {
        csv += `"${a.name}","${a.category}","${a.brand}","${a.compatibleModels}",${a.stockQty},${a.costPrice},${a.sellingPrice},"${a.barcode}"\n`;
      });
    } else {
      csv = 'Name,Type,Brand,Compatible,Stock,Cost,SellingPrice,Supplier\n';
      filteredParts.forEach(p => {
        csv += `"${p.name}","${p.partType}","${p.brand}","${p.compatibleModels}",${p.stockQty},${p.costPrice},${p.sellingPrice},"${p.supplier}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Stock_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Form Submissions
  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneModel || !phoneImei1) return;

    const sku = `PHN-${phoneBrand.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    addPhoneDevice({
      sku,
      brand: phoneBrand,
      model: phoneModel,
      storage: phoneStorage,
      color: phoneColor,
      imei1: phoneImei1,
      imei2: phoneImei2 || undefined,
      condition: phoneCondition,
      batteryHealth: phoneBattery,
      carrierStatus: phoneCarrier,
      lockStatus: phoneLockStatus,
      costPrice: phoneCost,
      sellingPrice: phoneSelling,
      status: 'In Stock',
      warrantyDays: phoneWarranty,
      supplier: 'Direct Purchase / Vendor Distribution'
    });

    setIsAddPhoneModalOpen(false);
    // Reset
    setPhoneModel('');
    setPhoneImei1('');
    setPhoneImei2('');
  };

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;

    const sku = `ACC-${accCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    addAccessory({
      sku,
      name: accName,
      category: accCategory,
      brand: accBrand,
      compatibleModels: accModels,
      stockQty: accQty,
      minAlertQty: accMinAlert,
      costPrice: accCost,
      sellingPrice: accSelling,
      barcode: accBarcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`
    });

    setIsAddAccessoryModalOpen(false);
    setAccName('');
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName) return;

    const sku = `PRT-${partType.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    addSparePart({
      sku,
      name: partName,
      partType,
      brand: partBrand,
      compatibleModels: partModels,
      stockQty: partQty,
      minAlertQty: partMinAlert,
      costPrice: partCost,
      sellingPrice: partSelling,
      supplier: partSupplier
    });

    setIsAddPartModalOpen(false);
    setPartName('');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#FAF8F5] dark:bg-[#080E1A]">
      {/* Top Filter and Actions Strip */}
      <div className="p-3 sm:p-4 border-b border-[#E8E3D7] dark:border-[#182744] bg-white dark:bg-[#0A1221] flex flex-wrap items-center justify-between gap-3 sm:gap-4 shrink-0">
        {/* Sub-tabs */}
        <div className="overflow-x-auto max-w-full pb-0.5 scrollbar-none">
          <div className="inline-flex rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#F5F2EB] dark:bg-[#0F1A2E] p-0.5 text-xs shrink-0 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('phones')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'phones'
                  ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Smartphones ({devices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'accessories'
                  ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Accessories ({accessories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'parts'
                  ? 'bg-white dark:bg-[#14223D] text-teal-800 dark:text-teal-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Spare Parts ({spareParts.length})</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IMEI, model, SKU, barcode..."
              className="w-full sm:w-60 pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          {activeTab === 'phones' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="in_stock">In Stock</option>
              <option value="sold">Sold Units</option>
              <option value="all">All Records</option>
            </select>
          )}

          <button
            onClick={exportStockCsv}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md bg-white dark:bg-[#0F1A2E] hover:bg-[#FAF8F5] transition-colors"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-4 h-4" />
          </button>

          {activeTab === 'phones' && (
            <button
              onClick={() => setIsAddPhoneModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Smartphone</span>
            </button>
          )}

          {activeTab === 'accessories' && (
            <button
              onClick={() => setIsAddAccessoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Accessory</span>
            </button>
          )}

          {activeTab === 'parts' && (
            <button
              onClick={() => setIsAddPartModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spare Part</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Area with Horizontal Scroll */}
      <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-3">
        {activeTab === 'phones' && (
          <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[1050px] border-collapse">
              <thead className="bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'} w-64`}>Device Model & Specs</th>
                  <th className="px-4 w-44">15-Digit IMEI</th>
                  <th className="px-4 w-36">Grade & Battery</th>
                  <th className="px-4 w-36">Carrier / Lock</th>
                  <th className="px-4 text-right w-28">Cost Price</th>
                  <th className="px-4 text-right w-28">Retail Price</th>
                  <th className="px-4 text-right w-32">Gross Margin</th>
                  <th className="px-4 w-28 text-center">Status</th>
                  <th className="px-4 text-center w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
                {filteredPhones.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      No smartphones found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPhones.map(device => {
                    const marginAmt = device.sellingPrice - device.costPrice;
                    const marginPct = ((marginAmt / device.sellingPrice) * 100).toFixed(0);
                    const isSold = device.status === 'Sold';

                    return (
                      <tr key={device.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] transition-colors">
                        <td className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {device.brand} {device.model}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {device.storage} · {device.color} · SKU: <span className="font-mono">{device.sku}</span>
                          </div>
                        </td>

                        <td className="px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{device.imei1}</span>
                            <button
                              onClick={() => copyImeiToClipboard(device.imei1)}
                              className="p-1 text-slate-400 hover:text-teal-700"
                              title="Copy IMEI"
                            >
                              {copiedImei === device.imei1 ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          {device.imei2 && <div className="text-[10px] text-slate-400">SIM 2: {device.imei2}</div>}
                        </td>

                        <td className="px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{device.condition}</div>
                          {device.batteryHealth !== undefined && (
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Battery: <span className="font-bold text-slate-700 dark:text-slate-300">{device.batteryHealth}%</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4">
                          <div className="text-slate-700 dark:text-slate-300">{device.carrierStatus}</div>
                          <div className="text-[10px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                            {device.lockStatus}
                          </div>
                        </td>

                        <td className="px-4 text-right font-mono text-slate-500 tabular-nums">
                          {storeSettings.currencySymbol}{device.costPrice.toFixed(2)}
                        </td>

                        <td className="px-4 text-right font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                          {storeSettings.currencySymbol}{device.sellingPrice.toFixed(2)}
                        </td>

                        <td className="px-4 text-right font-mono text-teal-700 dark:text-teal-400 font-semibold tabular-nums">
                          +{marginPct}% ({storeSettings.currencySymbol}{marginAmt.toFixed(0)})
                        </td>

                        <td className="px-4 text-center">
                          <button
                            onClick={() => {
                              const newStatus = device.status === 'In Stock' ? 'Reserved' : 'In Stock';
                              updatePhoneDevice(device.id, { status: newStatus });
                            }}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                              device.status === 'In Stock'
                                ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 hover:bg-teal-100'
                                : device.status === 'Reserved'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title="Click to toggle Stock Status"
                          >
                            {device.status}
                          </button>
                        </td>

                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isSold ? (
                              <button
                                onClick={() => setActiveView('pos')}
                                className="px-2 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                                title="Open in Counter POS to sell"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Sell</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Sold Out</span>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Remove ${device.brand} ${device.model} (IMEI: ${device.imei1}) from inventory?`)) {
                                  deletePhoneDevice(device.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Device"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[920px] border-collapse">
              <thead className="bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>Item Name & Category</th>
                  <th className="px-4">SKU / Barcode</th>
                  <th className="px-4">Compatible Devices</th>
                  <th className="px-4 text-center">Stock</th>
                  <th className="px-4 text-right">Cost</th>
                  <th className="px-4 text-right">Retail</th>
                  <th className="px-4 text-right">Gross Margin</th>
                  <th className="px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
                {filteredAccessories.map(acc => {
                  const isLowStock = acc.stockQty <= acc.minAlertQty;
                  const marginAmt = acc.sellingPrice - acc.costPrice;
                  const marginPct = ((marginAmt / acc.sellingPrice) * 100).toFixed(0);

                  return (
                    <tr key={acc.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] transition-colors">
                      <td className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{acc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{acc.brand} · {acc.category}</div>
                      </td>
                      <td className="px-4 font-mono text-[11px]">
                        <div>{acc.sku}</div>
                        <div className="text-slate-400">{acc.barcode}</div>
                      </td>
                      <td className="px-4 text-slate-600 dark:text-slate-300">{acc.compatibleModels}</td>
                      <td className="px-4 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          isLowStock 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' 
                            : 'bg-[#F5F2EB] dark:bg-[#14223D] text-slate-800 dark:text-slate-200'
                        }`}>
                          {acc.stockQty} in stock
                        </span>
                        {isLowStock && <div className="text-[10px] text-amber-600 mt-0.5 font-semibold">Low Stock</div>}
                      </td>
                      <td className="px-4 text-right font-mono text-slate-500 tabular-nums">
                        {storeSettings.currencySymbol}{acc.costPrice.toFixed(2)}
                      </td>
                      <td className="px-4 text-right font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                        {storeSettings.currencySymbol}{acc.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 text-right font-mono text-teal-700 dark:text-teal-400 font-semibold tabular-nums">
                        +{marginPct}% ({storeSettings.currencySymbol}{marginAmt.toFixed(2)})
                      </td>
                      <td className="px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove accessory "${acc.name}" from inventory?`)) {
                              deleteAccessory(acc.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Delete accessory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'parts' && (
          <div className="bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[920px] border-collapse">
              <thead className="bg-[#F5F2EB] dark:bg-[#0F1A2E] border-b border-[#E8E3D7] dark:border-[#182744] text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>Part Description & Type</th>
                  <th className="px-4">SKU / Supplier</th>
                  <th className="px-4">Compatible Phone Models</th>
                  <th className="px-4 text-center">Stock</th>
                  <th className="px-4 text-right">Cost</th>
                  <th className="px-4 text-right">Bench Charge</th>
                  <th className="px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D7] dark:divide-[#182744]">
                {filteredParts.map(part => {
                  const isLow = part.stockQty <= part.minAlertQty;

                  return (
                    <tr key={part.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#0F1A2E] transition-colors">
                      <td className={`px-4 ${isCompactDensity ? 'py-2' : 'py-3'}`}>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{part.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{part.partType} · {part.brand}</div>
                      </td>
                      <td className="px-4 font-mono text-[11px]">
                        <div>{part.sku}</div>
                        <div className="text-slate-400">{part.supplier}</div>
                      </td>
                      <td className="px-4 text-slate-600 dark:text-slate-300">{part.compatibleModels}</td>
                      <td className="px-4 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          isLow 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' 
                            : 'bg-[#F5F2EB] dark:bg-[#14223D] text-slate-800 dark:text-slate-200'
                        }`}>
                          {part.stockQty} in stock
                        </span>
                        {isLow && <div className="text-[10px] text-amber-600 mt-0.5 font-semibold">Reorder</div>}
                      </td>
                      <td className="px-4 text-right font-mono text-slate-500 tabular-nums">
                        {storeSettings.currencySymbol}{part.costPrice.toFixed(2)}
                      </td>
                      <td className="px-4 text-right font-mono font-bold text-teal-800 dark:text-teal-300 text-sm tabular-nums">
                        {storeSettings.currencySymbol}{part.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove spare part "${part.name}" from inventory?`)) {
                              deleteSparePart(part.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Delete part"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Add Smartphone */}
      {isAddPhoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-2xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-xs">
            <div className="p-4 border-b border-[#E8E3D7] dark:border-[#182744] flex justify-between items-center bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Smartphone to Inventory</h3>
                <p className="text-slate-500 text-xs mt-0.5">Register a unique smartphone with 15-digit IMEI and condition grading.</p>
              </div>
              <button onClick={() => setIsAddPhoneModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <form onSubmit={handleAddPhone} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Brand</label>
                  <select
                    value={phoneBrand}
                    onChange={(e) => setPhoneBrand(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Storage</label>
                  <select
                    value={phoneStorage}
                    onChange={(e) => setPhoneStorage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Primary 15-Digit IMEI *</label>
                  <input
                    type="text"
                    required
                    value={phoneImei1}
                    onChange={(e) => setPhoneImei1(e.target.value)}
                    placeholder="354891108294012"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">IMEI 2 (Optional)</label>
                  <input
                    type="text"
                    value={phoneImei2}
                    onChange={(e) => setPhoneImei2(e.target.value)}
                    placeholder="Optional secondary IMEI"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Color</label>
                  <input
                    type="text"
                    value={phoneColor}
                    onChange={(e) => setPhoneColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Condition</label>
                  <select
                    value={phoneCondition}
                    onChange={(e) => setPhoneCondition(e.target.value as DeviceCondition)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="Brand New Sealed">Brand New Sealed</option>
                    <option value="Open Box / Grade A+">Open Box / Grade A+</option>
                    <option value="Grade A (Excellent)">Grade A (Excellent)</option>
                    <option value="Grade B (Minor Wear)">Grade B (Minor Wear)</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Battery Health %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={phoneBattery}
                    onChange={(e) => setPhoneBattery(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Cost ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={phoneCost}
                    onChange={(e) => setPhoneCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Retail ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={phoneSelling}
                    onChange={(e) => setPhoneSelling(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Warranty (Days)</label>
                  <input
                    type="number"
                    value={phoneWarranty}
                    onChange={(e) => setPhoneWarranty(parseInt(e.target.value) || 90)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E3D7] dark:border-[#182744] flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#0A1221] py-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhoneModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 hover:bg-[#FAF8F5] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
                >
                  Save Smartphone into Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Accessory */}
      {isAddAccessoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-2xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden text-xs">
            <div className="p-4 border-b border-[#E8E3D7] dark:border-[#182744] flex justify-between items-center bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Accessory Item</h3>
              <button onClick={() => setIsAddAccessoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddAccessory} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. 65W GaN Fast Charger"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={accCategory}
                    onChange={(e) => setAccCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="Screen Protectors">Screen Protectors</option>
                    <option value="Protective Cases">Protective Cases</option>
                    <option value="Chargers & Cables">Chargers & Cables</option>
                    <option value="Audio & TWS">Audio & TWS</option>
                    <option value="Mounts & Powerbanks">Mounts & Powerbanks</option>
                    <option value="Wearables">Wearables</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    value={accBrand}
                    onChange={(e) => setAccBrand(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={accQty}
                    onChange={(e) => setAccQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={accMinAlert}
                    onChange={(e) => setAccMinAlert(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Cost ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={accCost}
                    onChange={(e) => setAccCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Retail Price ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={accSelling}
                    onChange={(e) => setAccSelling(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E3D7] dark:border-[#182744] flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#0A1221] py-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccessoryModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
                >
                  Save Accessory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Spare Part */}
      {isAddPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0A1221] rounded-lg shadow-2xl border border-[#E8E3D7] dark:border-[#182744] w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden text-xs">
            <div className="p-4 border-b border-[#E8E3D7] dark:border-[#182744] flex justify-between items-center bg-[#FAF8F5] dark:bg-[#0F1A2E] shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Spare Part / Screen</h3>
              <button onClick={() => setIsAddPartModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddPart} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Part Description *</label>
                <input
                  type="text"
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro OLED Display"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Part Type</label>
                  <select
                    value={partType}
                    onChange={(e) => setPartType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="OLED / LCD Screen">OLED / LCD Screen</option>
                    <option value="OEM Battery">OEM Battery</option>
                    <option value="Charging Port Flex">Charging Port Flex</option>
                    <option value="Rear Camera Module">Rear Camera Module</option>
                    <option value="Back Glass Housing">Back Glass Housing</option>
                    <option value="Speaker / Mic">Speaker / Mic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Compatible Models</label>
                  <input
                    type="text"
                    value={partModels}
                    onChange={(e) => setPartModels(e.target.value)}
                    placeholder="e.g. SM-S918B"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Cost ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={partCost}
                    onChange={(e) => setPartCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Selling / Bench Charge ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={partSelling}
                    onChange={(e) => setPartSelling(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E3D7] dark:border-[#182744] flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#0A1221] py-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-xs"
                >
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
