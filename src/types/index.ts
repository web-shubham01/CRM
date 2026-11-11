export type DeviceCondition = 
  | 'Brand New Sealed' 
  | 'Open Box / Grade A+' 
  | 'Grade A (Excellent)' 
  | 'Grade B (Minor Wear)' 
  | 'Refurbished' 
  | 'Damaged / For Parts';

export type CarrierStatus = 'Factory Unlocked' | 'AT&T' | 'Verizon' | 'T-Mobile' | 'Other Carrier';
export type LockStatus = 'Clean & Verified' | 'FRP Clean' | 'iCloud Signed Out' | 'Check Required';

export interface PhoneDevice {
  id: string;
  sku: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  imei1: string;
  imei2?: string;
  serialNumber?: string;
  condition: DeviceCondition;
  batteryHealth?: number; // e.g. 94%
  carrierStatus: CarrierStatus;
  lockStatus: LockStatus;
  costPrice: number;
  sellingPrice: number;
  warrantyDays: number;
  status: 'In Stock' | 'Sold' | 'Reserved' | 'In Repair Bench';
  supplier: string;
  dateAdded: string;
  soldDate?: string;
  invoiceId?: string;
}

export interface AccessoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Screen Protectors' | 'Protective Cases' | 'Chargers & Cables' | 'Audio & TWS' | 'Mounts & Powerbanks' | 'Wearables';
  brand: string;
  compatibleModels: string;
  stockQty: number;
  minAlertQty: number;
  costPrice: number;
  sellingPrice: number;
  barcode: string;
}

export interface SparePartItem {
  id: string;
  sku: string;
  name: string;
  partType: 'OLED / LCD Screen' | 'OEM Battery' | 'Charging Port Flex' | 'Rear Camera Module' | 'Back Glass Housing' | 'Speaker / Mic' | 'Logic Board IC';
  brand: string;
  compatibleModels: string;
  stockQty: number;
  minAlertQty: number;
  costPrice: number;
  sellingPrice: number; // Retail / Repair price
  supplier: string;
}

export type RepairStatus = 
  | 'RECEIVED' 
  | 'IN_DIAGNOSIS' 
  | 'WAITING_PARTS' 
  | 'IN_PROGRESS' 
  | 'TESTING_QC' 
  | 'READY_FOR_PICKUP' 
  | 'COMPLETED_DELIVERED' 
  | 'CANCELLED_RETURNED';

export type RepairPriority = 'Normal' | 'Urgent' | 'Warranty Claim';

export interface DiagnosticsChecklist {
  screenTouch: boolean;
  displayArtifacts: boolean;
  frontCamera: boolean;
  backCamera: boolean;
  faceIdBiometrics: boolean;
  earpieceSpeaker: boolean;
  loudspeaker: boolean;
  microphone: boolean;
  chargingPort: boolean;
  wirelessBluetooth: boolean;
  physicalButtons: boolean;
  waterDamageIndicator: boolean;
}

export interface PartUsage {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string; // e.g. WO-8491
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerial: string;
  deviceColor: string;
  passcodeOrPin: string;
  patternMatrix?: number[]; // indices 0-8 for 3x3 pattern lock
  cosmeticConditionNotes: string;
  
  reportedIssues: string[];
  diagnosticsChecklist: DiagnosticsChecklist;
  assignedTechnician: string;
  priority: RepairPriority;
  status: RepairStatus;
  
  estimatedCost: number;
  depositPaid: number;
  finalCost: number;
  partsUsed: PartUsage[];
  laborCharge: number;
  
  warrantyPeriod: string; // e.g. "90 Days Screen Warranty"
  internalTechNotes: string;
  customerFacingNotes: string;
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  deliveredAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loyaltyPoints: number;
  totalSpent: number;
  customerType: 'Regular Customer' | 'Wholesale / B2B' | 'VIP Member';
  notes: string;
  associatedImeis: string[];
  createdAt: string;
  lastVisit: string;
}

export interface CartLineItem {
  id: string;
  type: 'DEVICE' | 'ACCESSORY' | 'SPARE_PART' | 'REPAIR_PAYMENT' | 'CUSTOM_SERVICE';
  name: string;
  skuOrImei: string;
  unitPrice: number;
  quantity: number;
  warrantyInfo?: string;
  refId?: string; // e.g. phone id or repair ticket id
}

export interface TradeInItem {
  brand: string;
  model: string;
  imei: string;
  storage: string;
  conditionGrade: DeviceCondition;
  batteryHealth: number;
  icloudStatus: string;
  agreedPayoutValue: number;
  customerGovtId?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-9041
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: CartLineItem[];
  tradeInCredit?: TradeInItem;
  
  subtotal: number;
  discount: number;
  taxRate: number; // percentage, e.g. 8.25
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  changeDue: number;
  
  paymentMethod: 'Cash' | 'Credit/Debit Card' | 'Bank Transfer / UPI' | 'Split Payment' | 'Store Credit';
  paymentStatus: 'PAID' | 'PARTIAL' | 'REFUNDED';
  cashier: string;
  createdAt: string;
  receiptNotes?: string;
}

export interface CashRegisterShift {
  id: string;
  isOpen: boolean;
  openedAt: string;
  openedBy: string;
  openingCash: number;
  closedAt?: string;
  closedBy?: string;
  closingExpectedCash?: number;
  closingActualCash?: number;
  cashVariance?: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  payouts: { reason: string; amount: number; time: string }[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  email: string;
  taxNumber: string;
  currencySymbol: string;
  defaultTaxRate: number;
  repairWarrantyClause: string;
  salesReturnPolicy: string;
  thermalReceiptFooter: string;
}

export interface ActionManualNotice {
  id: string;
  timestamp: string;
  module: 'pos' | 'repairs' | 'inventory' | 'crm' | 'tradein' | 'register' | 'sales' | 'settings';
  actionTitle: string;
  whatHappened: string;
  nextStep: string;
  aToZStep: string;
  guideChapterId: string;
}
