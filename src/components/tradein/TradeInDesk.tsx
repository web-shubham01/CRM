import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DeviceCondition } from '../../types';

interface PresetValuation {
  brand: string;
  model: string;
  storage: string;
  baseValuation: number;
}

const valuationPresets: PresetValuation[] = [
  { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256GB', baseValuation: 650 },
  { brand: 'Apple', model: 'iPhone 15 Pro', storage: '128GB', baseValuation: 550 },
  { brand: 'Apple', model: 'iPhone 14 Pro', storage: '128GB', baseValuation: 420 },
  { brand: 'Apple', model: 'iPhone 13', storage: '128GB', baseValuation: 280 },
  { brand: 'Apple', model: 'iPhone 12', storage: '128GB', baseValuation: 190 },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '512GB', baseValuation: 680 },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', storage: '256GB', baseValuation: 450 },
  { brand: 'Google', model: 'Pixel 8 Pro', storage: '128GB', baseValuation: 320 },
  { brand: 'OnePlus', model: 'OnePlus 12', storage: '256GB', baseValuation: 340 }
];

export const TradeInDesk: React.FC = () => {
  const { addPhoneDevice, storeSettings } = useStore();

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(2);
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('Space Black');
  const [condition, setCondition] = useState<DeviceCondition>('Grade A (Excellent)');
  const [batteryHealth, setBatteryHealth] = useState<number>(89);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGovtId, setCustomerGovtId] = useState('');
  
  // Inspection Checklist Toggles
  const [screenPass, setScreenPass] = useState(true);
  const [camerasPass, setCamerasPass] = useState(true);
  const [faceIdPass, setFaceIdPass] = useState(true);
  const [buttonsPass, setButtonsPass] = useState(true);
  const [icloudClean, setIcloudClean] = useState(true);
  const [imeiClean, setImeiClean] = useState(true);

  const [overrideValue, setOverrideValue] = useState<number | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const currentPreset = valuationPresets[selectedPresetIndex];

  // Calculate Appraisal Multipliers
  let gradeMultiplier = 0.85;
  if (condition === 'Brand New Sealed') gradeMultiplier = 1.05;
  else if (condition === 'Open Box / Grade A+') gradeMultiplier = 0.95;
  else if (condition === 'Grade A (Excellent)') gradeMultiplier = 0.85;
  else if (condition === 'Grade B (Minor Wear)') gradeMultiplier = 0.70;
  else if (condition === 'Refurbished') gradeMultiplier = 0.65;
  else if (condition === 'Damaged / For Parts') gradeMultiplier = 0.35;

  let functionalDeductions = 0;
  if (!screenPass) functionalDeductions += 90;
  if (!camerasPass) functionalDeductions += 60;
  if (!faceIdPass) functionalDeductions += 45;
  if (!buttonsPass) functionalDeductions += 25;
  if (batteryHealth < 80) functionalDeductions += 35;

  const baseCalculated = Math.max(25, Math.round((currentPreset.baseValuation * gradeMultiplier) - functionalDeductions));
  const finalValuation = overrideValue !== null ? overrideValue : baseCalculated;

  const handleStockDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei || !customerName) return;

    const sku = `TRD-${currentPreset.brand.substring(0, 3).toUpperCase()}-${currentPreset.storage}`;

    addPhoneDevice({
      sku,
      brand: currentPreset.brand,
      model: currentPreset.model,
      storage: currentPreset.storage,
      color,
      imei1: imei,
      condition,
      batteryHealth,
      carrierStatus: 'Factory Unlocked',
      lockStatus: icloudClean ? 'Clean & Verified' : 'Check Required',
      costPrice: finalValuation,
      sellingPrice: Math.round(finalValuation * 1.35),
      warrantyDays: 60,
      status: 'In Stock',
      supplier: `Trade-In: ${customerName} (ID: ${customerGovtId || 'Verified'})`
    });

    setSuccessNotice(`Appraised ${currentPreset.brand} ${currentPreset.model} has been added directly to Pre-Owned inventory! Cost: ${storeSettings.currencySymbol}${finalValuation}.`);
    
    setImei('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerGovtId('');
    setOverrideValue(null);

    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#FAF8F5] dark:bg-[#080E1A] p-4 sm:p-6 select-none">
      <div className="max-w-4xl mx-auto w-full space-y-5 sm:space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Pre-Owned Device Appraisal & Buyback Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade incoming customer used devices, verify IMEI blacklist status, and intake into inventory.
          </p>
        </div>

        {successNotice && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-md text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1 */}
            <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-3 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                1. Select Make, Model & Storage Tier
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Device Model</label>
                  <select
                    value={selectedPresetIndex}
                    onChange={(e) => {
                      setSelectedPresetIndex(parseInt(e.target.value));
                      setOverrideValue(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    {valuationPresets.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.brand} {p.model} ({p.storage})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Color Finish</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Natural Titanium"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">15-Digit Device IMEI *</label>
                <input
                  type="text"
                  required
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="358291048102948"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-3 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                2. Cosmetic Grading & Battery Health
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Cosmetic Grade</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as DeviceCondition)}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  >
                    <option value="Brand New Sealed">Sealed (105% Value)</option>
                    <option value="Open Box / Grade A+">Grade A+ Flawless (95% Value)</option>
                    <option value="Grade A (Excellent)">Grade A Normal (85% Value)</option>
                    <option value="Grade B (Minor Wear)">Grade B Scratched (70% Value)</option>
                    <option value="Damaged / For Parts">Damaged / Salvage (35% Value)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Battery Health: {batteryHealth}%</label>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(parseInt(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>60% Service</span>
                    <span>80% Normal</span>
                    <span>100% Peak</span>
                  </div>
                </div>
              </div>

              {/* Functional Toggles */}
              <div className="pt-2 border-t border-[#E8E3D7] dark:border-[#182744]">
                <span className="text-[11px] font-medium text-slate-500 block mb-2">Hardware Check Results:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#FAF8F5] dark:bg-[#0F1A2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={screenPass}
                      onChange={(e) => setScreenPass(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>OLED Flawless</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#FAF8F5] dark:bg-[#0F1A2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camerasPass}
                      onChange={(e) => setCamerasPass(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Cameras Clean</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#FAF8F5] dark:bg-[#0F1A2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={faceIdPass}
                      onChange={(e) => setFaceIdPass(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Face ID / Touch</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#FAF8F5] dark:bg-[#0F1A2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={buttonsPass}
                      onChange={(e) => setButtonsPass(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Buttons Clean</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#FAF8F5] dark:bg-[#0F1A2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={icloudClean}
                      onChange={(e) => setIcloudClean(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>iCloud Clean</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] bg-[#FAF8F5] dark:bg-[#0F1A2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imeiClean}
                      onChange={(e) => setImeiClean(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Blacklist Clean</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs space-y-3 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                3. Customer Ownership & Government ID Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Thomas Wayne"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 891-2094"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Driver's License / ID #</label>
                  <input
                    type="text"
                    value={customerGovtId}
                    onChange={(e) => setCustomerGovtId(e.target.value)}
                    placeholder="TX-DL-948201"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Valuation Card */}
          <div className="space-y-4">
            <div className="p-5 bg-white dark:bg-[#0A1221] rounded-lg border border-[#E8E3D7] dark:border-[#182744] shadow-2xs text-xs space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Appraisal Summary</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {currentPreset.brand} {currentPreset.model}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Storage: {currentPreset.storage} · {condition}
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] dark:bg-[#0F1A2E] rounded-md border border-[#E8E3D7] dark:border-[#1C2E52] space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Base Wholesale:</span>
                  <span className="font-mono">{storeSettings.currencySymbol}{currentPreset.baseValuation}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Grade Multiplier:</span>
                  <span className="font-mono">{(gradeMultiplier * 100).toFixed(0)}%</span>
                </div>
                {functionalDeductions > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Defects:</span>
                    <span className="font-mono">-{storeSettings.currencySymbol}{functionalDeductions}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 dark:text-slate-200 pt-1 border-t border-[#E8E3D7] dark:border-[#182744]">
                  <span>Calculated Offer:</span>
                  <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                    {storeSettings.currencySymbol}{baseCalculated}
                  </span>
                </div>
              </div>

              {/* Counter Staff Override */}
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  Agreed Payout Offer ({storeSettings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  value={overrideValue !== null ? overrideValue : baseCalculated}
                  onChange={(e) => setOverrideValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-[#0F1A2E] border border-[#E8E3D7] dark:border-[#1C2E52] rounded-md font-mono font-bold text-base text-teal-800 dark:text-teal-300"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStockDirectly}
                  disabled={!imei || !customerName}
                  className="w-full py-2.5 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs disabled:opacity-40 transition-colors shadow-xs"
                >
                  Buy Device & Place in Inventory
                </button>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Simulated GSMA IMEI Check: Clean, No Stolen Flags.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
