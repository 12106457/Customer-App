import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of the profile data
interface ProfileProps {
  name: string;
  email: string;
  phone: string;
}

// Define the shape of the context value
interface ProfileContextValue {
    registionData: ProfileProps;
  setRegistionData: React.Dispatch<React.SetStateAction<ProfileProps>>;
}

// Create the context with a default value
export const registerContext = createContext<ProfileContextValue>({
    registionData: {
    name:"",
    email:"",
    phone:""
  },
  setRegistionData: () => {},

});

interface ProfileContextProviderProps {
  children: ReactNode;
}

export function RegisterContextProvider({ children }: ProfileContextProviderProps) {
  const [registionData, setRegistionData] = useState<ProfileProps>({
    name:"",
    email:"",
    phone:""
  });

  const userContextValue: ProfileContextValue = {
    registionData,
    setRegistionData,
  };

  return (
    <registerContext.Provider value={userContextValue}>
      {children}
    </registerContext.Provider>
  );
}
