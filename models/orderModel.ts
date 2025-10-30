export interface OrderApiResponse {
    status: boolean;
    message: string;
    data: OrderDataItem[];
  }
  
  export interface OrderDataItem {
    _id: string;
    orderNo: string;
    customerId: string;
    shopId: Shop | null;
    items: OrderItem[];
    totalOrderAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    orderType: OrderType;
    shippingAddress?: ShippingAddress;
    estimatedDelivery: string; // ISO string
  }
  
  export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  
  export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refund';
  
  export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery' | 'UPI';
  
  export type OrderType = 'Cash_On_Delivery' | 'Take_A_Way';
  
  export interface Shop {
    _id: string;
    name: string;
    shopAddress: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    shopCategory: string[];
    shopImage: string;
    openingHours: string;
    rating: number;
  }
  
  export interface OrderItem {
    _id: string;
    productId: Product | null;
    quantity: number;
    totalAmount: number;
  }
  
  export interface Product {
    _id: string;
    prodId: {
      _id: string;
      image: string;
    };
    name: string;
    category: string;
    description: string;
    price: number;
  }
  
  export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  }
  