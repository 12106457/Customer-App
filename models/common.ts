export interface ProductData {
    _id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    available: boolean;
    prodId: {
      _id: string;
      name: string;
      image: string;
    };
    shopId: string;
  }

  export interface ProductDetails {
    _id: string;
    shopId: string;
    prodId: {
      _id: string;
      name: string;
      image: string;
    };
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    available: boolean;
  }
  
  export interface CartItem {
    productId: ProductDetails;
    quantity: number;
    totalAmount: number;
    _id: string;
  }


  export interface CartProductType  {
    productId: ProductData;
    quantity: number;
    totalAmount: number;
    // _id: string;
  };