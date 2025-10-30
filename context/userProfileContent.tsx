import Colors from '@/constants/Colors';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'; 
import {CartItem,CartProductType} from "@/models/common"


interface userProfileType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image: null;
  walletBalance: number;
  orders: any[];
  referralCode: null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cart: string;
}

interface userContextType {
  setUserData: React.Dispatch<React.SetStateAction<userProfileType | undefined>>;
  userData: userProfileType | undefined;
  setAuthToken:React.Dispatch<React.SetStateAction<string | undefined>>;
  authToken:string|undefined;
}

const userContext = createContext<userContextType | undefined>(undefined);

export const ProfileProvider = ({ children }:any) => {
  const [userData, setUserData] = useState<userProfileType>();
  const[authToken,setAuthToken]=useState<string>()

  useEffect(()=>{
    console.log("update the cart from usecontext:",userData);
  },[userData]);

  return (
    <userContext.Provider value={{userData,setUserData,authToken,setAuthToken }}>
      {children}
    </userContext.Provider>
  );
};

// Custom hook to use the spinner context
export const useProfileData = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error('useProfileData must be used within a userProvider');
  }
  return context;
};
