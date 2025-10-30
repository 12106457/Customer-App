import Colors from '@/constants/Colors';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'; 
import {CartItem,CartProductType} from "@/models/common"


interface cartItemType{
  productId: ProductId;
  quantity: number;
  totalAmount: number;
}
interface ProductId {
  _id: string;
  shopId: string;
  prodId: ProdId;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
}
interface ProdId {
  _id: string;
  name: string;
  image: string;
}

interface cartContextType {
    setCartData: React.Dispatch<React.SetStateAction<CartProductType[]>>;
    cartData:CartProductType[];
}

const cartContext = createContext<cartContextType | undefined>(undefined);

export const CartProvider = ({ children }:any) => {
  const [cartData, setCartData] = useState<CartProductType[]>([]);

  useEffect(()=>{
    console.log("update the cart from usecontext:",cartData);
  },[cartData]);

  return (
    <cartContext.Provider value={{cartData,setCartData }}>
      {children}
    </cartContext.Provider>
  );
};

// Custom hook to use the spinner context
export const useCart = () => {
  const context = useContext(cartContext);
  if (!context) {
    throw new Error('usecart must be used within a cartProvider');
  }
  return context;
};
