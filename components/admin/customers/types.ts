export type CustomerCategory =
  | "vip"
  | "frequent"
  | "active"
  | "new";

export interface AdminCustomer {
  email: string;
  customerName: string;
  artistName: string | null;

  ordersCount: number;
  paidOrdersCount: number;
  productsCount: number;

  totalSpent: number;
  currency: string;

  firstPurchaseAt: string | null;
  lastPurchaseAt: string | null;

  category: CustomerCategory;
  
  purchases: CustomerPurchase[];
}

export interface CustomerOrder {
  id: string;
  status: string | null;
  paymentProvider: string | null;
  paymentReference: string | null;
  currency: string;
  total: number;
  productsCount: number;
  createdAt: string;
  paidAt: string | null;
}
export interface CustomerPurchase {
  id: string;

  beatTitle: string;

  license: string;

  total: number;

  currency: string;

  paymentStatus: string | null;

  paymentProvider: string | null;

  purchaseDate: string;

  downloadUrl?: string | null;
}