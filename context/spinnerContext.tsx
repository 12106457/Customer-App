import Colors from '@/constants/Colors';
import React, { createContext, useContext, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'; 

interface SpinnerContextType {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading:boolean;
}

const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined);

export const SpinnerProvider = ({ children }:any) => {
  const [loading, setLoading] = useState(false);

  

  return (
    <SpinnerContext.Provider value={{ setLoading,loading}}>
      {children}
      <Spinner visible={loading} animation={"fade"} textContent="" size="large" 
        customIndicator={    <ActivityIndicator size="large" color="#ff5733" style={{ transform: [{ scale: 1.8 }] }} />
      }
      textStyle={{ color: '#FFF' }} />
    </SpinnerContext.Provider>
  );
};

// Custom hook to use the spinner context
export const useSpinner = () => {
  const context = useContext(SpinnerContext);
  if (!context) {
    throw new Error('useSpinner must be used within a SpinnerProvider');
  }
  return context;
};
